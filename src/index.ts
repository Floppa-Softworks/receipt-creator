import createReceipt from './lib/createReceipt';
createReceipt({ store: 'bals', date: 'balls2' }, [
	{ itemName: 'Ball1', quantity: 2, cost: '5.99' },
	{ itemName: 'Ball2', quantity: 4, cost: '4.99' },
	{ itemName: 'Ball3', quantity: 6, cost: '3.99' },
	{ itemName: 'Ball4', quantity: 8, cost: '2.99' },
]);
