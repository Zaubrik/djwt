import { assertEquals } from "./test_depts.ts";

import { verify as verifyAlgorithm } from "../_algorithm.ts";

Deno.test("[jwt] verify algorithm", function () {
  assertEquals(verifyAlgorithm("HS512", "HS512"), true);
  assertEquals(verifyAlgorithm("HS512", "HS256"), false);
  assertEquals(verifyAlgorithm(["HS512"], "HS512"), true);
  assertEquals(verifyAlgorithm(["HS256", "HS512"], "HS512"), true);
  assertEquals(verifyAlgorithm(["HS512"], "HS256"), false);
});
