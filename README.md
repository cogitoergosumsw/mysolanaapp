# mysolanaapp

## What is this

This is my first step into developing apps on the Solana blockchain. And also familiarizing myself with the Rust framework.

## Prerequisites 

1. Node.js 
2. Solana Tool Suite - You can see the installation instructions [here](https://docs.solana.com/cli/install-solana-cli-tools). note - If you have any issues installing Solana on an M1 Mac, try building from source and check out this guide.
3. Anchor - You can find the installation instructions [here](https://project-serum.github.io/anchor/getting-started/installation.html)
4. Solana browser wallet - I recommend Phantom, which is what I have tested this app with.

## Configuration

---- For local testing purposes ----
1. Change the directory of the local wallet in `Anchor.toml` and `Cargo.toml` files under `[provider]` i.e. `wallet = "/home/test/.config/solana/id.json"` *if setting up for the first time, run `solana-keygen new`
2. Start the Solana localnet - `solana-test-validator`
3. from the root directory, run `anchor build` && `anchor deploy`
4. cd `app`
5. run `yarn serve`

You should be able to interact with the dApp locally now.

## Reference

great tutorial to build a Solana Twitter-like dApp - https://lorisleiva.com/create-a-solana-dapp-from-scratch