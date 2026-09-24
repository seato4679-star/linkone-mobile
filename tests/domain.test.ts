import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate, plans, calls } from "../src/lib/plans.ts";
import {
  applicationSubmitErrorMessage,
  validateApplication,
  isStatus,
  isUuid,
} from "../src/lib/validation.ts";

const valid = {
  name: "デモ 太郎",
  email: "demo@example.com",
  phone: "09000000000",
  plan: "smart",
  call_option: "none",
  support: false,
  campaign: true,
  consent: true,
};

test("every plan/call/support combination has consistent initial and regular totals", () => {
  for (const plan of plans)
    for (const call of calls)
      for (const support of [false, true]) {
        const price = estimate(plan.id, call.id, support, true);
        assert.equal(
          price.regular,
          plan.price + call.price + (support ? 330 : 0),
        );
        assert.equal(
          price.initial,
          price.regular - (plan.id === "smart" ? 1000 : 0),
        );
      }
  assert.equal(estimate("smart", "none", false, false).initial, 1980);
});
test("valid applications normalize whitespace, email case and phone hyphens", () => {
  const result = validateApplication({
    ...valid,
    name: " デモ 太郎 ",
    email: " Demo@Example.com ",
    phone: "090-0000-0000",
  });
  assert.deepEqual(result.errors, {});
  assert.equal(result.data?.phone, "09000000000");
  assert.equal(result.data?.email, "demo@example.com");
  assert.equal(result.data?.name, "デモ 太郎");
});
test("rejects missing input, malformed contact details and forged choices", () => {
  for (const value of [
    null,
    [],
    "input",
    {},
    { ...valid, email: "broken" },
    { ...valid, phone: "1234" },
    { ...valid, name: "x" },
    { ...valid, plan: "free" },
    { ...valid, call_option: "free" },
    { ...valid, support: "false" },
    { ...valid, consent: false },
    { ...valid, campaign: "true" },
    { ...valid, plan: "light" },
  ]) {
    assert.equal(validateApplication(value).data, undefined);
  }
});
test("length limits and control characters are rejected", () => {
  assert.ok(
    validateApplication({ ...valid, name: "a".repeat(81) }).errors.name,
  );
  assert.deepEqual(
    validateApplication({ ...valid, name: "😀".repeat(80) }).errors,
    {},
  );
  assert.ok(
    validateApplication({ ...valid, name: "😀".repeat(81) }).errors.name,
  );
  assert.ok(validateApplication({ ...valid, name: "demo\nuser" }).errors.name);
  assert.ok(
    validateApplication({ ...valid, email: `${"a".repeat(250)}@example.com` })
      .errors.email,
  );
});
test("application submission warns before retrying after a 503", () => {
  assert.equal(
    applicationSubmitErrorMessage(503, "temporary failure"),
    "受付済みの可能性があります。再送する前に管理担当者にご確認ください。",
  );
});
test("API ignores attacker-supplied IDs/status/prices", () => {
  const result = validateApplication({
    ...valid,
    status: "completed",
    price: 0,
    id: "chosen",
  });
  assert.ok(result.data);
  assert.equal("status" in result.data, false);
  assert.equal("price" in result.data, false);
  assert.equal("id" in result.data, false);
});
test("status and UUID validation rejects unexpected route input", () => {
  assert.equal(isStatus("reviewing"), true);
  assert.equal(isStatus("deleted"), false);
  assert.equal(isUuid("734ed971-7a1b-4e31-94f2-a227d50cd662"), true);
  assert.equal(isUuid("1&select=*"), false);
});
