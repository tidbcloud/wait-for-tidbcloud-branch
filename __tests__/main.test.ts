import {wait} from '../src/wait'
import {expect, test} from '@jest/globals'
import {sqluser} from "../src/sqluser";
import * as core from "@actions/core";

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  var delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

// replace the externalId, public key and private key with your own
test('sqluser', async () => {
  const externalId = "{\"project_id\":\"163469\",\"cluster_id\":\"2939253\",\"branch_id\":\"branch-t393ywvw3qhswh7getjzwv\",\"branch_name\":\"syh-test2\"}"
  const sqlUser = await sqluser( externalId,
      msg => core.info(msg),
      "",
      "",
     "dev")
  console.log(sqlUser)
})
