export default () => {
    self.onmessage = function(mess) {
        const credentials = {
            "account": {
                "id": "xak7yiBTi4VWfvS7NThXJA==",
                "accountType": 0,
                "publicKey": "GDC2SO6KEBJYXBKWP32LWNJYK4SMWNSQIKA2VQY7EUIUPPUISRGUWHZY",
                "version": 1,
                "friendlyName": "Test local",
                "encryptedSecret": "dyp9bi9RIETL9TXUUubkrty6BY2mGOJO0Da2w8QhsYaJDm75hQ5kOFamPD5Gngd/1u2ID0kjldg=",
                "seen": {
                    "testnet": {
                        "op": 85803,
                        "cb": 85745
                    },
                    "public": {
                        "cb": 46971711,
                        "op": 46971711
                    }
                },
                "addressBook": {
                    "GAADPNSDKBDOK2NGNQTFUV4M3COUHQ2DO65FEONYBLJYN2NKY57CB2GG": {
                        "editMode": true,
                        "name": "Name",
                        "network": "testnet",
                        "memo": {
                            "type": "text",
                            "value": "Test",
                            "encodeMuxedAddress": false
                        },
                        "federation_address": "",
                        "undefined": {
                            "address": "GAADPNSDKBDOK2NGNQTFUV4M3COUHQ2DO65FEONYBLJYN2NKY57CB2GG",
                            "editMode": true,
                            "name": "Test",
                            "network": "testnet",
                            "memo": {
                                "type": "none",
                                "value": "ws",
                                "encodeMuxedAddress": false
                            },
                            "federation_address": ""
                        }
                    },
                    "GA6H66VCFV2IFSERGV6VBH2UXQHDN4ZDY2G7EMIPITRYPNUH6R6COOLN": {
                        "editMode": false,
                        "name": "yazadji",
                        "federation_address": "yazadji*stellarterm.com",
                        "memo": {
                            "type": "text",
                            "value": "123"
                        }
                    },
                    "GBSL3NTDWH5G6E53STFQKO37ENKE2BOLHGSCHLFERE57IQ2D6NF3IQ2A": {
                        "name": "yazadzhy",
                        "federation_address": "yazadzhy*stellarterm.com",
                        "memo": {
                            "type": "none",
                            "value": "test"
                        }
                    }
                },
                "cbFilter": "2612091634af3fcb4f2f81fefa4513065a803029f620f84c541e1ddd70ff4648fe04c8ac0a5aa25c8070baad9e21a11c"
            },
            "password": "Yazadjidima1994!",
            "timestamp": "2023-07-01T15:08:13.388Z",
            "encryptionKey": {
                "0": 226,
                "1": 162,
                "2": 248,
                "3": 121,
                "4": 98,
                "5": 61,
                "6": 75,
                "7": 23,
                "8": 217,
                "9": 24,
                "10": 178,
                "11": 231,
                "12": 16,
                "13": 98,
                "14": 46,
                "15": 143,
                "16": 143,
                "17": 58,
                "18": 104,
                "19": 165,
                "20": 110,
                "21": 192,
                "22": 35,
                "23": 26,
                "24": 73,
                "25": 53,
                "26": 96,
                "27": 21,
                "28": 27,
                "29": 158,
                "30": 106,
                "31": 206
            },
            "authKey": "8/lGV3W8opqTXzu8QbxJv7mGVKRj86bIVqu65ucyx9c="
        }
        switch (mess.data.action) {
        case 'setCredentials':
            self.postMessage(true)
            break
        case 'getCredentials':
            self.postMessage({
                credentials
            })
            break
        default: postMessage(false)
        }
    }
}