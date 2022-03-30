const bs58 = require('bs58');
const anchor = require("@project-serum/anchor");
const assert = require("assert")

describe("mysolanaapp", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.Provider.env());
    const program = anchor.workspace.Mysolanaapp;

    it('can send a new tweet', async () => {
        // Call the "SendTweet" instruction.
        const test_tweet = anchor.web3.Keypair.generate();
        await program.rpc.sendTweet('veganism', 'Hummus, am I right?', {
            accounts: {
                tweet: test_tweet.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [test_tweet],
        });

        // Fetch the account details of the created tweet.
        const tweetAccount = await program.account.tweet.fetch(test_tweet.publicKey);

        // Ensure it has the right data.
        assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
        assert.equal(tweetAccount.topic, 'veganism');
        assert.equal(tweetAccount.content, 'Hummus, am I right?');
        assert.ok(tweetAccount.timestamp);
    });

    it('can send tweet without a topic', async () => {
        const test_tweet = anchor.web3.Keypair.generate();
        await program.rpc.sendTweet('', 'gm', {
            accounts: {
                tweet: test_tweet.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [test_tweet],
        });

        const tweetAccount = await program.account.tweet.fetch(test_tweet.publicKey);

        // Ensure it has the right data.
        assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
        assert.equal(tweetAccount.topic, '');
        assert.equal(tweetAccount.content, 'gm');
        assert.ok(tweetAccount.timestamp);
    });

    it('can send a new tweet from a different author', async () => {
        // Generate another user and airdrop them some SOL.
        const otherUser = anchor.web3.Keypair.generate();

        // Call the "SendTweet" instruction on behalf of this other user.
        const test_tweet = anchor.web3.Keypair.generate();

        // airdrop some money to otherUser so that he will have enough SOL to pay for the tweet
        const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
        await program.provider.connection.confirmTransaction(signature);

        await program.rpc.sendTweet('veganism', 'Yay Tofu!', {
            accounts: {
                tweet: test_tweet.publicKey,
                author: otherUser.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [otherUser, test_tweet],
        });

        // Fetch the account details of the created tweet.
        const tweetAccount = await program.account.tweet.fetch(test_tweet.publicKey);

        // Ensure it has the right data.
        assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
        assert.equal(tweetAccount.topic, 'veganism');
        assert.equal(tweetAccount.content, 'Yay Tofu!');
        assert.ok(tweetAccount.timestamp);
    });

    it('cannot provide a topic with more than 50 characters', async () => {
        const tweet = anchor.web3.Keypair.generate();
        const topicWith51Chars = 'x'.repeat(51);
        try {
            await program.rpc.sendTweet(topicWith51Chars, 'Hummus, am I right?', {
                accounts: {
                    tweet: tweet.publicKey,
                    author: program.provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
                signers: [tweet],
            });
        } catch (error) {
            assert.equal(error.error.errorMessage, 'The provided topic should be 50 characters long maximum.');
            return;
        }
        assert.fail('The instruction should have failed with a 51-character topic.');
    });

    it('can fetch all tweets', async () => {
        const tweetAccounts = await program.account.tweet.all();
        assert.equal(tweetAccounts.length, 3);
    });

    it('can filter tweets by author', async () => {
        const authorPublicKey = program.provider.wallet.publicKey
        const tweetAccounts = await program.account.tweet.all([
            {
                memcmp: {
                    offset: 8, // Discriminator.
                    bytes: authorPublicKey.toBase58(),
                }
            }
        ]);

        assert.ok(tweetAccounts.every(tweetAccount => {
            return tweetAccount.account.author.toBase58() === authorPublicKey.toBase58()
        }))
    });

    it('can filter tweets by topics', async () => {
        const tweetAccounts = await program.account.tweet.all([
            {
                memcmp: {
                    offset: 8 + // Discriminator.
                        32 + // Author public key.
                        8 + // Timestamp.
                        4, // Topic string prefix.
                    bytes: bs58.encode(Buffer.from('veganism')),
                }
            }
        ]);

        assert.ok(tweetAccounts.every(tweetAccount => {
            return tweetAccount.account.topic === 'veganism'
        }))
    });
});
