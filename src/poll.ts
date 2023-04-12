import {GitHub} from '@actions/github/lib/utils'
import {wait} from './wait'

export class CheckRunOutput {
  conclusion: string | null
  externalID: string | null
  constructor(conclusion: string | null, externalID: string | null) {
    this.conclusion = conclusion
    this.externalID = externalID
  }
}

export interface Options {
  client: InstanceType<typeof GitHub>
  log: (message: string) => void

  checkName: string
  timeoutSeconds: number
  intervalSeconds: number
  owner: string
  repo: string
  ref: string
}

export const poll = async (options: Options): Promise<CheckRunOutput> => {
  const {
    client,
    log,
    checkName,
    timeoutSeconds,
    intervalSeconds,
    owner,
    repo,
    ref
  } = options

  let now = new Date().getTime()
  const deadline = now + timeoutSeconds * 1000

  while (now <= deadline) {
    log(
      `Retrieving check runs named ${checkName} on ${owner}/${repo}@${ref}...`
    )
    const result = await client.rest.checks.listForRef({
      check_name: checkName,
      owner,
      repo,
      ref
    })

    log(
      `Retrieved ${result.data.check_runs.length} check runs named ${checkName}`
    )

    const completedCheck = result.data.check_runs.find(
      checkRun => checkRun.status === 'completed'
    )
    if (completedCheck) {
      log(
        `Found a completed check with id ${completedCheck.id} and conclusion ${completedCheck.conclusion}`
      )
      return new CheckRunOutput(
        completedCheck.conclusion,
        completedCheck.external_id
      )
    }

    log(
      `No completed checks named ${checkName}, waiting for ${intervalSeconds} seconds...`
    )
    await wait(intervalSeconds * 1000)

    now = new Date().getTime()
  }

  log(`No completed checks after ${timeoutSeconds} seconds,giving up.`)
  throw new Error(`timeout after ${timeoutSeconds} seconds`)
}
