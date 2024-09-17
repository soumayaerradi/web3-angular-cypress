import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';

import { WalletService } from '../../../core/service/wallet.service';
import { NetworkService } from '../../../core/service/network.service';

import { GlobalVariables } from '../../../core/helpers/global-variables';
import { ChainId, NETWORK_INFO } from '../../../core/helpers/networks';


/***
 * address 1: 0x2060266bA136DC0b2f4D5Cebd147209F0954C756
 * address 2: 0x87028e52304A3d58D6d48DC5a864815Ab70fB6F5
 */

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  win: any;
  primary_network = NETWORK_INFO[ChainId.Sepolia];

  LINK_ADDRESS: string = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
  LINK_ABI: string[] = [
    'function name() public view returns (string name)',
    'function balanceOf(address _owner) public view returns (uint256 balance)',
    'function transfer(address _to, uint256 _value) public returns (bool success)',
  ];

  checked: boolean = false;
  balance: string | undefined;
  amount: string = '';
  recipient: string = '';
  transferStatus: string = '';

  constructor(
    private _walletService: WalletService,
    private _networkService: NetworkService,
  ) {
    this.win = window as any;

    // init network necessary
    _walletService.initNetwork(this.primary_network);

    // check account
    this.getProvider()
      // check network only if needed
      .then((_) => _networkService.checkNetwork(this.primary_network));
  }

  ngOnInit(): void {
    this.getTokenName();
  }

  async getTokenName() {
    const provider = new ethers.providers.JsonRpcProvider(this.primary_network.rpcUrls[0]);
    const linkContract = new ethers.Contract(this.LINK_ADDRESS, this.LINK_ABI, provider);
    const tokenName = await linkContract['name']();

    console.log('Token name:', tokenName);
  }

  async getBalance() {
    const provider = this.getGlobalVariables().metaMaskExtProvider;
    const web3provider = new ethers.providers.Web3Provider(provider);
    const signer = web3provider.getSigner();
    const userAddress = await signer.getAddress();

    const linkContract = new ethers.Contract(this.LINK_ADDRESS, this.LINK_ABI, signer);

    let linkBalance = await linkContract['balanceOf'](userAddress);
    console.log('balance in Bignumber:', linkBalance);

    linkBalance = ethers.utils.formatUnits(linkBalance, 18);
    console.log('balance in string:', linkBalance);


    this.balance = linkBalance;
  }

  async transfer() {
    this.transferStatus = '';
    const provider = this.getGlobalVariables().metaMaskExtProvider;
    const web3provider = new ethers.providers.Web3Provider(provider);
    const signer = web3provider.getSigner();

    const linkContract = new ethers.Contract(this.LINK_ADDRESS, this.LINK_ABI, signer);

    const amountFormatted = ethers.utils.parseEther(this.amount);

    try {
      const tx = await linkContract['transfer'](this.recipient, amountFormatted);
      console.log('Transaction:', tx);

      const receipt = await tx.wait();
      console.log('Receipt:', receipt);

      this.transferStatus = 'Transaction confirmed';
    } catch (e: any) {
      console.error(e);
      const message: string = e.message;

      if (message.includes('user rejected transaction')) {
        this.transferStatus = 'Transaction rejected';
      } else {
        this.transferStatus = 'Error';
      }
    }
  }

  getGlobalVariables(): GlobalVariables {
    return this._walletService.getGlobalVariables();
  }

  async getProvider(): Promise<void> {
    await this._walletService.getWebProvider();
  }

  async disconnectWallet(): Promise<void> {
    await this._walletService.disconnectWallet();
  }

  openConnect(): void {
    this._walletService.connectWallet('metamask').then((res) => {
      console.info(`Wallet connected: ${res}`);
    });
  }
}
