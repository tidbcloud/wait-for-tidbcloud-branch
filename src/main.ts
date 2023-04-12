import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {poll} from './poll'
import {sqluser} from './sqluser'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    if (context.payload.pull_request === undefined) {
      throw new Error('This action only works on pull_request events now')
    }
    const result = await poll({
      client: getOctokit(token),
      log: msg => core.info(msg),

      checkName: 'TiDB Cloud Branch',
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: context.payload.pull_request.head.sha,

      timeoutSeconds: parseInt(core.getInput('timeoutSeconds')),
      intervalSeconds: parseInt(core.getInput('intervalSeconds'))
    })

    // check result
    if (result.conclusion === null || result.conclusion === '') {
      throw new Error('TiDB Cloud Branch check conclusion is empty')
    }
    if (result.conclusion !== 'success') {
      throw new Error('TiDB Cloud Branch check failed')
    }
    if (result.externalID === null || result.externalID === '') {
      throw new Error('externalID is empty with success conclusion')
    }

    const sqlUser = await sqluser(
      result.externalID,
      msg => core.info(msg),
      core.getInput('publicKey'),
      core.getInput('privateKey'),
      core.getInput('env')
    )
    if (core.getInput('addMask') === 'true') {
      core.info('addMask is true, set secret for sql user password')
      core.setSecret(sqlUser.password)
    }
    core.info(
      `Got sql user. host: ${sqlUser.host}, username: ${sqlUser.username}, password: ${sqlUser.password}`
    )
    core.setOutput('host', sqlUser.host)
    core.setOutput('username', sqlUser.username)
    core.setOutput('password', sqlUser.password)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
