import {Twemoji} from 'react-emoji-render'
import {AiOutlineRedo} from 'react-icons/ai'
import {IoAdd, IoCloseCircleOutline, IoRemove} from 'react-icons/io5'
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	Divider,
	Fade,
	Grid,
	IconButton,
	styled,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TextField,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import capitalize from 'lodash/capitalize'
import {useSnackbar} from 'notistack'

import {NoFundsDialog} from './NoFundsDialog'
import {TransferFundsSuccessDialog} from './TransferFundsSuccessDialog'

import MetaMaskFoxLogo from '@/assets/metamask-fox.svg'
import {AddressChip} from '@/components/AddressChip'
import {DialogTitle} from '@/components/DialogTitle'
import {useMetaMask} from '@/providers/MetaMaskProvider'
import {purpleButton} from '@/theming/purpleButton'
import {rainbowText} from '@/theming/rainbowText'
import {TxType} from '@/types'
import {TRANSFER_COST} from '@/utils/calculateCost'
import {getSuggestedFee} from '@/utils/spacesVM'
import {isValidWalletAddress} from '@/utils/verifyAddress'

type TransferFundsDialogProps = {
	open: boolean
	close(): void
}

const SubmitButton = styled(Button)(({ theme }: any) => ({
	...purpleButton(theme),
}))

export const TransferFundsDialog = ({ open, close }: TransferFundsDialogProps) => {
	const { currentAddress, balance, signWithMetaMask, issueTx } = useMetaMask()
	const theme = useTheme()
	const [toAddress, setToAddress] = useState<string>('')
	const [addressInputError, setAddressInputError] = useState<string | undefined>()
	const [transferAmount, setTransferAmount] = useState<number>(0)
	const [isSigning, setIsSigning] = useState<boolean>(false)
	const [isDone, setIsDone] = useState<boolean>(false)
	const { enqueueSnackbar, closeSnackbar } = useSnackbar()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
	const [finalTxAmount, setFinalTxAmount] = useState<number>(0)
	const [finalToAddress, setFinalToAddress] = useState<string>('')

	// Transfer the funds!
	const onSubmit = async () => {
		setIsSigning(true)
		setFinalTxAmount(transferAmount)
		setFinalToAddress(toAddress)
		try {
			const { typedData } = await getSuggestedFee({
				type: TxType.Transfer,
				to: toAddress,
				units: transferAmount,
			})
			const signature = await signWithMetaMask(typedData)
			if (!signature) {
				setIsSigning(false)
				return
			}
			const success = await issueTx(typedData, signature)
			setIsSigning(false)
			if (!success) {
				onSubmitFailure()
				return
			}
			setIsDone(true)
		} catch (error: any) {
			// eslint-disable-next-line no-console
			console.error(error)
			enqueueSnackbar(capitalize(error?.message), {
				variant: 'error',
			})
			setIsSigning(false)
		}
	}

	const onSubmitFailure = async () => {
		enqueueSnackbar("Oops!  Something went wrong and we couldn't transfer your SPC.  Try again!", {
			variant: 'warning',
			persist: true,
			action: (
				<>
					<Button
						startIcon={<AiOutlineRedo />}
						variant="outlined"
						color="inherit"
						onClick={() => {
							closeSnackbar()
							onSubmit()
						}}
					>
						Retry transfer
					</Button>
					<Tooltip title="Dismiss">
						<IconButton onClick={() => closeSnackbar()} color="inherit">
							<IoCloseCircleOutline />
						</IconButton>
					</Tooltip>
				</>
			),
		})
	}

	// When changing wallet addresses, make sure they can't transfer more than in the new account's balance
	useEffect(() => {
		if (balance === null || balance - TRANSFER_COST > transferAmount) return
		setTransferAmount(balance - TRANSFER_COST)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [balance])

	// Do some regex magic to check that it's a valid 0x wallet address
	useEffect(() => {
		const isValidToAddress = isValidWalletAddress(toAddress)
		setAddressInputError(
			!isValidToAddress && toAddress?.length !== 0 ? 'Please enter a valid public wallet address.' : undefined,
		)
	}, [toAddress])

	// Reset the modal state for the next time its opened before closing
	const handleClose = () => {
		setToAddress('')
		setAddressInputError(undefined)
		setTransferAmount(0)
		setIsDone(false)
		close()
	}

	if (!currentAddress) return null

	const maxTransferAmount = Math.min(100000000, balance - TRANSFER_COST)

	return (
		<>
			<Dialog fullScreen={isMobile} maxWidth="sm" open={open && !!balance && !isDone} onClose={handleClose}>
				<DialogTitle onClose={handleClose}>
					<Typography gutterBottom variant="h3" component="p" fontFamily="DM Serif Display" align="center">
						Transfer CTIM
					</Typography>
				</DialogTitle>
				<DialogContent>
					<Table>
						<TableBody>
							<TableRow>
								<TableCell align="right" sx={{ pr: 0, width: 0 }}>
									From:
								</TableCell>
								<TableCell>
									<AddressChip isObfuscated={isMobile} address={currentAddress} tooltipPlacement="top" />
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell align="right" sx={{ borderBottomWidth: 0, pr: 0, width: 0 }}>
									To:
								</TableCell>
								<TableCell sx={{ borderBottomWidth: 0 }}>
									<TextField
										color="secondary"
										variant="filled"
										value={toAddress}
										name="keyText"
										autoFocus
										size="small"
										error={!!addressInputError}
										onChange={(e) => setToAddress(e.target.value)}
										placeholder="0x address"
										fullWidth
										InputProps={{
											sx: { fontSize: 18, fontWeight: 600, paddingBottom: '2px' },
										}}
										inputProps={{
											spellCheck: 'false',
											style: { paddingTop: 8 },
										}}
										autoComplete="off"
									/>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>

					<Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 2 }}>
						How much to send?
					</Typography>

					<Box display="flex" alignItems="center" justifyContent="center">
						<TextField
							color="secondary"
							value={transferAmount}
							name="keyText"
							onChange={(e) => {
								const val = parseInt(e.target.value, 10)
								setTransferAmount(Math.min(!isNaN(val) ? val : 0, maxTransferAmount))
							}}
							placeholder="Address"
							InputProps={{
								sx: { ...theme.typography.h2, ...rainbowText },
							}}
							inputProps={{
								spellCheck: 'false',
								style: {
									textAlign: 'right',
								},
							}}
							autoComplete="off"
							type="tel"
						/>

						<Divider flexItem orientation="vertical" sx={{ mr: 2 }} />

						<Typography variant="h4" component="span" color="textSecondary" sx={{ width: 100 }}>
							CTIM
						</Typography>
					</Box>

					<Grid
						container
						wrap={isMobile ? 'wrap' : 'nowrap'}
						justifyContent={'center'}
						alignItems="center"
						sx={{ my: 2 }}
						columnSpacing={{ sm: 3, xs: 1 }}
					>
						<Grid item sx={{ display: { xs: 'none', sm: 'inherit' } }}>
							<Button
								color="secondary"
								size="small"
								variant="outlined"
								startIcon={<IoRemove />}
								disabled={transferAmount <= 0}
								onClick={() => setTransferAmount(Math.max(transferAmount - 1000, 0))}
							>
								1K
							</Button>
						</Grid>
						<Grid item>
							<Button
								color="secondary"
								size="small"
								variant="outlined"
								startIcon={<IoRemove />}
								disabled={transferAmount <= 0}
								onClick={() => setTransferAmount(Math.max(transferAmount - 100, 0))}
							>
								100
							</Button>
						</Grid>
						<Grid item>
							<IconButton
								sx={{
									border: `1px solid rgba(82, 61, 241, 0.5)`,
									'&:hover': {
										border: (theme) => `1px solid ${theme.palette.secondary.main}`,
									},
									'&.Mui-disabled': {
										border: (theme) => `1px solid ${theme.palette.action.disabled}`,
									},
								}}
								color="inherit"
								size="large"
								disabled={transferAmount <= 0}
								onClick={() => setTransferAmount(Math.max(transferAmount - 1, 0))}
							>
								<IoRemove />
							</IconButton>
						</Grid>
						<Grid item>
							<IconButton
								sx={{
									border: `1px solid rgba(82, 61, 241, 0.5)`,
									'&:hover': {
										border: (theme) => `1px solid ${theme.palette.secondary.main}`,
									},
									'&.Mui-disabled': {
										border: (theme) => `1px solid ${theme.palette.action.disabled}`,
									},
								}}
								size="large"
								color="inherit"
								disabled={transferAmount >= maxTransferAmount}
								onClick={() => setTransferAmount(Math.min(transferAmount + 1, maxTransferAmount))}
							>
								<IoAdd />
							</IconButton>
						</Grid>
						<Grid item>
							<Button
								variant="outlined"
								size="small"
								startIcon={<IoAdd />}
								color="secondary"
								disabled={transferAmount >= maxTransferAmount}
								onClick={() => setTransferAmount(Math.min(transferAmount + 100, maxTransferAmount))}
							>
								100
							</Button>
						</Grid>
						<Grid item sx={{ display: { xs: 'none', sm: 'inherit' } }}>
							<Button
								variant="outlined"
								size="small"
								startIcon={<IoAdd />}
								color="secondary"
								disabled={transferAmount >= maxTransferAmount}
								onClick={() => setTransferAmount(Math.min(transferAmount + 1000, maxTransferAmount))}
							>
								1K
							</Button>
						</Grid>
					</Grid>
					<Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
						<Tooltip
							placement="top"
							title={addressInputError ? addressInputError : transferAmount <= 0 ? 'Add some SPC to send!' : ''}
						>
							<Box sx={{ cursor: !!addressInputError || transferAmount <= 0 ? 'help' : 'inherit' }}>
								<SubmitButton
									disabled={!!addressInputError || !toAddress?.length || transferAmount <= 0 || isSigning || isDone}
									variant="contained"
									type="submit"
									onClick={onSubmit}
									size="large"
									endIcon={<Twemoji svg text="✈️" />}
								>
									{isSigning ? (
										<Fade in={isSigning}>
											<img src={MetaMaskFoxLogo} alt="metamask-fox" style={{ height: '100%' }} />
										</Fade>
									) : (
										'Send'
									)}
								</SubmitButton>
							</Box>
						</Tooltip>
					</Box>
					<Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
						<Typography variant="caption" color="textSecondary">
							Fee: {TRANSFER_COST} SPC
						</Typography>
					</Box>
				</DialogContent>
			</Dialog>
			<TransferFundsSuccessDialog
				open={open && isDone}
				onClose={handleClose}
				transferAmount={finalTxAmount}
				toAddress={finalToAddress}
			/>
			<NoFundsDialog open={open && !balance && !isDone} onClose={handleClose} />
		</>
	)
}
