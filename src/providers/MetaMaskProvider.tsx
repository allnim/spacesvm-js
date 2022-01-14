import { IoDownloadOutline } from 'react-icons/io5'
import MetaMaskOnboarding from '@metamask/onboarding'
import { Button } from '@mui/material'
import { useSnackbar } from 'notistack'

import { metaMaskExists, mmRequestAccounts, signWithMetaMask } from '@/utils/metamask'
import { getClaimPayload } from '@/utils/quarkPayloads'

const ethereum = window.ethereum

const MetaMaskContext = createContext({} as any)

const onboarding = new MetaMaskOnboarding()

export const MetaMaskProvider = ({ children }: any) => {
	const [currentAddress, setCurrentAddress] = useState<string | undefined>()
	const { enqueueSnackbar } = useSnackbar()

	useEffect(() => {
		if (!metaMaskExists) return

		setCurrentAddress(ethereum.selectedAddress)

		// Listen for changes to the connected account selections
		return ethereum.on('accountsChanged', (accounts: any) => {
			console.log('---')
			console.log(accounts)
			setCurrentAddress(accounts[0])
		})
	}, [])

	const connectToMetaMask = () => {
		mmRequestAccounts()
	}

	const onboardToMetaMask = async () => {
		if (metaMaskExists) return
		enqueueSnackbar('MetaMask needs to be installed.', {
			variant: 'warning',
			persist: true,
			action: (
				<Button
					startIcon={<IoDownloadOutline />}
					variant="outlined"
					color="inherit"
					onClick={() => onboarding.startOnboarding()}
					sx={{ ml: 1, mr: -1 }}
				>
					Download MetaMask
				</Button>
			),
		})
	}

	const signClaimPayload = async (username: string): Promise<string | undefined> => {
		if (!metaMaskExists) {
			onboardToMetaMask()
			return
		}
		const claimPayload = await getClaimPayload(username)
		const signature = await signWithMetaMask(claimPayload)
		return signature
	}

	return (
		<MetaMaskContext.Provider
			value={{
				currentAddress,
				connectToMetaMask,
				onboardToMetaMask,
				signClaimPayload,
			}}
		>
			{children}
		</MetaMaskContext.Provider>
	)
}

export const useMetaMask = () => useContext(MetaMaskContext)
