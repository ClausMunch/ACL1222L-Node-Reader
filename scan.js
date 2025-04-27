const reader = require('acr1222l');
const readline = require('readline');
const util = require('util');

async function main() {
    console.log('Starting ACR1222L Reader...');

    await reader.initialize((err) => {
        console.error('Reader error:', err);
    }, debug = false);

    // etc...
}
main();
