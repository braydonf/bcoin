/* eslint-env mocha */
/* eslint prefer-arrow-callback: "off" */

'use strict';

const assert = require('bsert');
const FullNode = require('../lib/node/fullnode');
const SPVNode = require('../lib/node/spvnode');
const {forValue} = require('./util/common');

describe('Node Sync', function() {
  this.timeout(60000);

  const ports = {
    p2p: 49331,
    node: 49332,
    wallet: 49333
  };

  let node, node2, node3 = null;
  let wdb = null;
  let wallet = null;

  before(async () => {
    /**
     * Setup initial nodes and wallets.
     */

    node = new FullNode({
      memory: true,
      apiKey: 'foo',
      network: 'regtest',
      workers: true,
      workersSize: 2,
      bip37: true,
      plugins: [require('../lib/wallet/plugin')],
      listen: true,
      port: ports.p2p,
      httpPort: ports.node,
      env: {
        'BCOIN_WALLET_HTTP_PORT': ports.wallet.toString()
      }
    });

    await node.open();

    node2 = new FullNode({
      memory: true,
      apiKey: 'foo',
      network: 'regtest',
      workers: true,
      workersSize: 2,
      port: ports.p2p + 3,
      httpPort: ports.node + 3,
      only: [`127.0.0.1:${ports.p2p}`]
    });

    await node2.open();

    node3 = new SPVNode({
      memory: true,
      apiKey: 'foo',
      network: 'regtest',
      workers: true,
      workersSize: 2,
      port: ports.p2p + 6,
      httpPort: ports.node + 6,
      only: [`127.0.0.1:${ports.p2p}`]
    });

    await node3.open();

    /**
     * Generate blocks and transactions.
     */

    await node.connect();

    // Prepare the miner and wallet.
    const {miner, chain} = node;
    wdb = node.require('walletdb').wdb;
    wallet = await wdb.create();
    miner.addAddress(await wallet.receiveAddress());

    // Mature the initial coins to use for the
    // use in generating the test case.
    for (let i = 0; i < 200; i++) {
      const block = await miner.mineBlock();
      assert(await chain.add(block));
    }

    assert.strictEqual(chain.height, 200);

    // Generate several blocks of transactions.
    for (let b = 0; b < 5; b++) {
      let count = 0;

      while (count < 10) {
	const addr = await wallet.receiveAddress();

        await wallet.send({
          subtractFee: true,
          outputs: [{
            address: addr,
            value: 10000
          }]
        });

        count += 1;
      }

      const block = await miner.mineBlock();
      assert(await chain.add(block));
    }
  });

  after(async () => {
    await node.close();
    await node2.close();
    await node3.close();
  });

  it('should sync with node (full)', async () => {
    await node2.connect();
    await node2.startSync();

    await forValue(node2.chain, 'height', 205);
  });

  it('should sync with node (spv)', async () => {
    await node3.connect();
    await node3.startSync();

    await forValue(node3.chain, 'height', 205);
  });
});
