# wait-for-tidbcloud-branch

A JavaScript action that works with [TiDB Cloud App](https://github.com/apps/tidb-cloud). It allows you to:

- Wait for the `TiDB Cloud Branch` check which created by TiDB Cloud App to complete.
- Generate a SQL user for this TiDB Cloud branch.

## Usage

```
uses: tidbcloud/wait-for-tidbcloud-branch@v0
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  public-key: ${{ secrets.TIDB_CLOUD_API_PUBLIC_KEY }}
  private-key: ${{ secrets.TIDB_CLOUD_API_PRIVATE_KEY }}
```

## Inputs

The action supports the following inputs:
- token - (required) The GitHub token to use for making API requests. Typically, this would be set to ${{ secrets.GITHUB_TOKEN }}. You needn't set [GITHUB_TOKEN](https://docs.github.com/en/actions/security-guides/automatic-token-authentication), GitHub will automatically creates the secret.
- ref - (optional) The git ref of the commit you want to check. Default is `github.event.pull_request.head.sha`.
- public-key - (required) The public key of TiDB Cloud api. Generate it from [TiDB Cloud](https://tidbcloud.com/).
- private-key - (required) The private key of TiDB Cloud api. Generate it from [TiDB Cloud](https://tidbcloud.com/).
- interval-seconds - (optional) The interval seconds to check the status of TiDB Cloud Branch check. Default is 10.
- timeout-seconds - (optional) The timeout seconds to wait for TiDB Cloud Branch check. Default is 300.
- add-mask - (optional) Whether to add mask for the password output. Default is true.

## Outputs

The action provide the following outputs:

- host - The host of the TiDB Cloud branch.
- username - The username of the TiDB Cloud branch.
- password - The password of the TiDB Cloud branch.
- port - The port of the TiDB Cloud branch.

## Best practices

Set TiDB Cloud API publicKey and privateKey in your action secrets, and use them in your workflow.

Here is an example of how to use this action in a single job:

```
steps:
  - name: Wait for TiDB Cloud branch ready
    uses: tidbcloud/wait-for-tidbcloud-branch@v0
    id: wait-for-branch
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      public-key: ${{ secrets.TIDB_CLOUD_API_PUBLIC_KEY }}
      private-key: ${{ secrets.TIDB_CLOUD_API_PRIVATE_KEY }}

  - name: Use the output
     run: |
        echo "The host is ${{ steps.wait-for-branch.outputs.host }}"
        echo "The port is ${{ steps.wait-for-branch.outputs.port }}"
        echo "The username is ${{ steps.wait-for-branch.outputs.username }}"
        echo "The password is ${{ steps.wait-for-branch.outputs.password }}"
```

Here is an example of how to use this action for multiple jobs. 

> You must set addMask to false if you want to use the password in other jobs. Because GitHub action does not support sharing secrets between jobs now. See [this discussion](https://github.com/orgs/community/discussions/13082) for more details.


```
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: tidbcloud/wait-for-tidbcloud-branch@v0
        id: wait-for-branch
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          public-key: ${{ secrets.TIDB_CLOUD_API_PUBLIC_KEY }}
          private-key: ${{ secrets.TIDB_CLOUD_API_PRIVATE_KEY }}
          add-mask: false
    outputs:
      username: ${{ steps.wait-for-branch.outputs.username }}
      port : ${{ steps.wait-for-branch.outputs.port }}
      host: ${{ steps.wait-for-branch.outputs.host }}
      password: ${{ steps.wait-for-branch.outputs.password }}

  test:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Use the output
        run: |
          echo "The host is ${{ needs.setup.outputs.host }}"
          echo "The port is ${{ needs.setup.outputs.port }}"
          echo "The username is ${{ needs.setup.outputs.username }}"
          echo '::add-mask::${{ needs.setup.outputs.password }}'
          echo "The password is ${{ needs.setup.outputs.password }}"       
```


## License

See [LICENSE](LICENSE).

## Dev Guide

See [docs/dev_guide.md](docs/dev_guide.md) for more details.


