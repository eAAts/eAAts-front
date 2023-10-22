# eAAts-front
<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img  src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

Project related to **ETHGlobal**.

**eAAts** is a blockchain-based service that allows users to easily order food with multiple people.
**eAAts-front** provides a screen to users who want to use **eAAts**.

- **Login**: Don't worry! You can log in without a blockchain wallet. We used [Web3AuthModalPack](https://docs.safe.global/reference/auth-kit/web3authmodalpack) provided by [Safe](https://safe.global/) to implement users to log in with their social accounts. Of course, you can log in via Email and MetaMask.
- **Order List**: Provides a list of all orders, from orders that recruit users to orders that are in delivery to orders that have been delivered.
- **Order Detail**: Users can view restaurants and menus for selected orders. In the case of an order in which an order has not been started, the user may select a delivery fee payment method and participate in the order.
- **Add Order**: It provides users with the ability to create orders by selecting a delivery fee method and the minimum number of orders.

## Start Guide

### Requirements

|Name|Version|
|------|---|
|node|v18.16.0|


### Installation

Clone this repository.
```shell
$ git clone https://github.com/eAAts/eAAts-front.git
```

Navigate to the project folder.
```shell
$ cd eAAts-front
```

Install dependencies.
```shell
$ yarn
```

### Runs the app

Runs the app in the development mode.
Open `http://localhost:3000` to view it in your browser.
```shell
yarn start
```

## Contribution

If you would like to contribute to the project, please fork the repository, make your changes, and then submit a pull request. We appreciate all contributions and feedback!

## Delivery notification with push protocol SDK
site : https://push.org/

Use push protocol sdk to send notifications in four situations
- Create order
- join order
- start delivery
- complete delivery
