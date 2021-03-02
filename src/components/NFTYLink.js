import React, {useState} from 'react';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { Web3 } from "web3";
import { ethers } from "ethers";

/************/
// querystring () //
function queryString(){
	let search = window.location.search;
	let params = new URLSearchParams(search);
	let querystring = params.get('token');
	return querystring;
}


/************/
// querystring () //
function loginWithSignature(){
	let search = window.location.search;
	let params = new URLSearchParams(search);
	let querystring = params.get('token');
	return querystring;
}


/************/
// walletconnect //
async function WC()
{
	const [isAuth, authUser] = useState(false);
  	const [error, setError] = useState("");
  	const querystring_auth_token = queryString();

	const connector = new WalletConnect({
	  bridge: "https://bridge.walletconnect.org", // Required
	  qrcodeModal: QRCodeModal,
	});

	// Check if connection is already established
	if (!connector.connected) {
	  // create new session
	  connector.createSession();
	}

	// Subscribe to connection events
	connector.on("connect", (error, payload) => {
		if (error) {
			throw error;
		}

	  	// Get provided accounts and chainId
		const { accounts, chainId } = payload.params[0];

	  	// Draft Message Parameters
		const secret_hash = ethers.utils.hashMessage(window.secret);


		const msgParams = [
		  querystring_auth_token,             					// Required
		  accounts[0]                             				// Required
		];




		/*
		var hex = ''
		for(var i=0;i<window.secret.length;i++) {
		    hex += ''+window.secret.charCodeAt(i).toString(16)
		}
		var hexMessage = "0x" + hex

		const msgParams = [
		  hexMessage,             					// Required
		  accounts[0]                             	// Required
		];*/

		// Sign personal message
		connector
		  	.signPersonalMessage(msgParams)
		  	.then((signature) => {		 
				loginWithSignature(accounts[0], signature);
			})
		  	.catch(error => {
		  		console.log(error);
			});
	})
}



/************/
// metamask //
async function MM()
{
	const [isAuth, authUser] = useState(false);
  	const [error, setError] = useState("");
  	const querystring_auth_token = queryString();

	// Modern dapp browsers...
	if (window.ethereum) {
	     try {
	     	window.web3 = new Web3(ethereum);
	        // Request account access if needed
	        await ethereum.enable();

	        // ethers.js setup
	        const provider = new ethers.providers.Web3Provider(window.ethereum);
	        const signer = await provider.getSigner();
			const address = await signer.getAddress();
			const secret_hash = ethers.utils.hashMessage(window.secret);

			var hex = ''
		    for(var i=0;i<window.secret.length;i++) {
		        hex += ''+window.secret.charCodeAt(i).toString(16)
		    }
		    var hexMessage = "0x" + hex

		    
	        // signature
	        const signature = await signer.provider.send("personal_sign", [hexMessage, address]);
	       	// const signature = await web3.eth.personal.sign(window.secret, address)
	       	if (signature){
	       		// post signature && address to login
		       	loginWithSignature(address, signature);
	       	}
			
	    }
	 	catch (error) {
	 		console.log('error')
	    }
	}
	// Non-dapp browsers...
	else {
	    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
	}

}




export default function NFTYLink(){
	return (
		<div>
			<WC></WC>
			<MM></MM>
		</div>
	)
}










