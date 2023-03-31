import { ethers } from './ethers-5.1.esm.min.js'
import { abi, contractAddress } from './constants.js'
const connectButton = document.getElementById('connect')
const fundButton = document.getElementById('fund')
const balanceButton = document.getElementById('balance')
const withdrawButton = document.getElementById('withdraw')

console.log(ethers)

const connect = async () => {
	if (typeof window.ethereum !== 'undefined') {
		try {
			await ethereum.request({ method: 'eth_requestAccounts' })
		} catch (error) {
			console.log(error)
		}
		connectButton.innerHTML = 'Connected'
		const accounts = await ethereum.request({ method: 'eth_accounts' })
		console.log(accounts)
	} else {
		// connectButton.innerHTML = 'Please install MetaMask'
		alert('Please install MetaMask extension on your browser.')
	}
}

const fund = async () => {
	const ethAmount = document.getElementById('eth-amount').value
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const contract = new ethers.Contract(contractAddress, abi, signer)
		try {
			const transactionResponse = await contract.fund({
				value: ethers.utils.parseEther(ethAmount),
			})
			console.log(transactionResponse)
			await listenForTransactionMine(transactionResponse, provider)
		} catch (error) {
			console.log(error)
		}
	} else {
		fundButton.innerHTML = 'Please install MetaMask'
	}
}

const withdraw = async () => {
	 console.log(`Withdrawing...`)
		if (typeof window.ethereum !== 'undefined') {
			const provider = new ethers.providers.Web3Provider(window.ethereum)
			await provider.send('eth_requestAccounts', [])
			const signer = provider.getSigner()
			const contract = new ethers.Contract(contractAddress, abi, signer)
			try {
				const transactionResponse = await contract.withdraw()
				await listenForTransactionMine(transactionResponse, provider)
				// await transactionResponse.wait(1)
			} catch (error) {
				console.log(error)
			}
		} else {
			withdrawButton.innerHTML = 'Please install MetaMask'
		}
}

const getBalance = async() => {
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		try {
			const balance = await provider.getBalance(contractAddress)
			console.log(ethers.utils.formatEther(balance))
		} catch (error) {
			console.log(error)
		}
	} else {
		alert('Please install MetaMask')
	}
}

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

function listenForTransactionMine(transactionResponse, provider) {
	console.log(`Mining ${transactionResponse.hash}`)
	return new Promise((resolve, reject) => {
		try {
			provider.once(transactionResponse.hash, (transactionReceipt) => {
				console.log(
					`Completed with ${transactionReceipt.confirmations} confirmations. `
				)
				console.log(transactionReceipt)
				resolve()
			})
		} catch (error) {
			reject(error)
		}
	})
}
