import { computed } from 'vue'
import { useAnchorWallet } from 'solana-wallets-vue'
import { Connection, PublicKey } from '@solana/web3.js'
import { Provider, Program } from '@project-serum/anchor'
import idl from '../../../target/idl/mysolanaapp.json'
// import idl from '@/idl/mysolanaapp.json'
// const clusterUrl = process.env.VUE_APP_CLUSTER_URL
const clusterUrl = "http://127.0.0.1:8899"
const preflightCommitment = 'processed'
const commitment = 'processed'
const programID = new PublicKey(idl.metadata.address)
let workspace = null

export const useWorkspace = () => workspace

export const initWorkspace = () => {
    const wallet = useAnchorWallet()
    const connection = new Connection(clusterUrl, commitment)
    // for devnet deployment
    // const connection = new Connection('https://api.devnet.solana.com', commitment)
    const provider = computed(() => new Provider(connection, wallet.value, { preflightCommitment, commitment }))
    const program = computed(() => new Program(idl, programID, provider.value))
    workspace = {
        wallet,
        connection,
        provider,
        program,
    }

}