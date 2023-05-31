import DigestFetch from '../node_modules/digest-fetch'

interface BranchInfo {
  project_id: string
  cluster_id: string
  branch_id: string
  branch_name: string
}

export class SqlUser {
  host: string
  username: string
  password: string
  port: number

  constructor(host: string, port: number, user: string, password: string) {
    this.host = host
    this.username = user
    this.password = password
    this.port = port
  }
}

export async function sqluser(
  externalID: string,
  log: (message: string) => void,
  publicKey: string,
  privateKey: string,
  env: string
): Promise<SqlUser> {
  log(`Start to get Sql User with externalID ${externalID}`)
  const branchInfo: BranchInfo = JSON.parse(externalID)
  const projectID = branchInfo.project_id
  const clusterID = branchInfo.cluster_id
  const branchID = branchInfo.branch_id
  const branchName = branchInfo.branch_name
  if (
    projectID === undefined ||
    clusterID === undefined ||
    branchID === undefined ||
    branchName === undefined
  ) {
    throw new Error('Invalid externalID from TiDB Cloud Branch check')
  }

  let host = 'https://api.tidbcloud.com'
  if (env === 'dev') {
    host = 'https://api.dev.tidbcloud.com'
  }
  if (env === 'staging') {
    host = 'https://api.staging.tidbcloud.com'
  }

  const client = new DigestFetch(publicKey, privateKey)

  // get sql user
  const sqlUserUrl = `${host}/api/internal/projects/${projectID}/clusters/${clusterID}/branches/${branchName}/users`
  log(`request url to get sql user: ${sqlUserUrl}`)
  const resp = await client.fetch(sqlUserUrl, {method: 'POST'})
  const data = await resp.json()
  if (data['username'] === undefined || data['password'] === undefined) {
    throw new Error(
      `Can not get sql user with response: ${JSON.stringify(data)}`
    )
  }

  // get branch info
  const branchUrl = `${host}/api/v1beta/clusters/${clusterID}/branches/${branchID}`
  log(`request url to get host and port: ${branchUrl}`)
  const resp2 = await client.fetch(branchUrl)
  const branch = await resp2.json()
  if (
    branch['endpoints'] === undefined ||
    branch['endpoints']['public_endpoint'] === undefined
  ) {
    throw new Error(
      `Can not get branch host and port with: ${JSON.stringify(branch)}`
    )
  }

  return new SqlUser(
    branch['endpoints']['public_endpoint']['host'],
    branch['endpoints']['public_endpoint']['port'],
    data['username'],
    data['password']
  )
}
