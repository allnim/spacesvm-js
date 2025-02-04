import {Twemoji} from 'react-emoji-render'
import {AiOutlineRedo} from 'react-icons/ai'
import {IoAdd, IoCloseCircleOutline, IoRemove} from 'react-icons/io5'
import {useParams} from 'react-router-dom'
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	Fade,
	Grid,
	IconButton,
	styled,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import {useSnackbar} from 'notistack'

import {LifelineDoneDialog} from './LifelineDoneDialog'

import MetaMaskFoxLogo from '@/assets/metamask-fox.svg'
import {DialogTitle} from '@/components/DialogTitle'
import {useMetaMask} from '@/providers/MetaMaskProvider'
import {purpleButton} from '@/theming/purpleButton'
import {rainbowText} from '@/theming/rainbowText'
import {TxType} from '@/types'
import {calculateLifelineCost, getDisplayLifelineTime, getExtendToTime} from '@/utils/calculateCost'
import {getSuggestedFee} from '@/utils/spacesVM'

const SubmitButton = styled(Button)(({ theme }: any) => ({
	...purpleButton(theme),
}))

type LifelineDialogProps = {
	open: boolean
	close(): void
	existingExpiry: number
	spaceUnits: number
	refreshSpaceDetails(): void
}

export const LifelineDialog = ({
	open,
	close,
	existingExpiry,
	spaceUnits,
	refreshSpaceDetails,
}: LifelineDialogProps) => {
	const { spaceId } = useParams()
	const theme = useTheme()
	const { issueTx, signWithMetaMask, balance } = useMetaMask()
	const [extendUnits, setExtendUnits] = useState<number>(0)
	const [fee, setFee] = useState<number>(0)
	const [isSigning, setIsSigning] = useState<boolean>(false)
	const [isDone, setIsDone] = useState<boolean>(false)
	const { enqueueSnackbar, closeSnackbar } = useSnackbar()
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

	// spaceUnits is from the API.  More stuff stored = more spaceUnits

	const onSubmit = async () => {
		setIsSigning(true)
		const { typedData } = await getSuggestedFee({
			type: TxType.Lifeline,
			space: spaceId,
			units: extendUnits,
		})
		const signature = await signWithMetaMask(typedData)
		setIsSigning(false)
		if (!signature) return
		const success = await issueTx(typedData, signature)
		if (!success) {
			onSubmitFailure()
			return
		}
		setIsDone(true)
		refreshSpaceDetails()
	}

	const onSubmitFailure = async () => {
		enqueueSnackbar("Oops!  Something went wrong and we couldn't extend your space's life.  Try again!", {
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

	useEffect(() => {
		if (!spaceId) return
		const newFee = calculateLifelineCost(spaceId, extendUnits)
		setFee(Math.floor(newFee))
	}, [extendUnits, spaceId, open])

	const handleClose = () => {
		setIsDone(false)
		setExtendUnits(0)
		close()
	}

	// Amount of time that will be extended
	const extendDurationDisplay = useMemo(() => {
		if (extendUnits === 0) return '0'
		return getDisplayLifelineTime(extendUnits, spaceUnits)
	}, [extendUnits, spaceUnits])

	// Explicit date that will be extended to
	const extendToDateDisplay = useMemo(
		() => getExtendToTime(extendUnits, spaceUnits, existingExpiry),
		[extendUnits, spaceUnits, existingExpiry],
	)

	return (
		<>
			<Dialog fullScreen={isMobile} open={open && !isDone} onClose={handleClose} maxWidth="sm">
				<DialogTitle onClose={handleClose}>
					<Typography variant="h4" component="p" fontFamily="DM Serif Display" align="center">
						Extend some life to{' '}
						<Typography
							variant="h4"
							fontFamily="DM Serif Display"
							component="span"
							sx={{
								...rainbowText,
							}}
						>
							{spaceId}
						</Typography>{' '}
						before it expires!&nbsp;
						<Twemoji svg text=":hourglass:" />
					</Typography>
				</DialogTitle>
				<DialogContent sx={{ overflowY: 'hidden', px: 0 }}>
					<Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
						Extend by
					</Typography>

					<Tooltip sx={{ cursor: 'help' }} placement="top" title={`Extend to ${extendToDateDisplay}`}>
						<Box display="flex" alignItems="center" justifyContent="center">
							<Typography variant="h2">{extendDurationDisplay}</Typography>
						</Box>
					</Tooltip>

					<Grid container wrap="nowrap" justifyContent={'center'} alignItems="center" sx={{ my: 2 }} columnSpacing={3}>
						<Grid item>
							<Tooltip placement="left" title={extendUnits <= 0 ? 'Add time!' : ''}>
								<span style={{ paddingTop: 20, paddingBottom: 20 }}>
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
										disabled={extendUnits <= 0}
										onClick={() => setExtendUnits(extendUnits - 1)}
									>
										<IoRemove />
									</IconButton>
								</span>
							</Tooltip>
						</Grid>
						<Grid item>
							<Tooltip
								placement="right"
								title={!spaceId || calculateLifelineCost(spaceId, extendUnits + 1) >= balance ? 'Not enough Copyright Tokens!' : ''}
							>
								<span style={{ paddingTop: 20, paddingBottom: 20 }}>
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
										disabled={!spaceId || calculateLifelineCost(spaceId, extendUnits + 1) >= balance}
										onClick={() => setExtendUnits(extendUnits + 1)}
									>
										<IoAdd />
									</IconButton>
								</span>
							</Tooltip>
						</Grid>
					</Grid>
					<Fade in={!isDone}>
						<div>
							<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
								<Tooltip placement="top" title={extendUnits <= 0 ? 'Add time to extend!' : ''}>
									<Box sx={{ cursor: extendUnits <= 0 ? 'help' : 'inherit' }}>
										<SubmitButton
											disabled={isSigning || extendUnits <= 0}
											variant="contained"
											type="submit"
											onClick={onSubmit}
										>
											{isSigning ? (
												<Fade in={isSigning}>
													<img src={MetaMaskFoxLogo} alt="metamask-fox" style={{ height: '100%' }} />
												</Fade>
											) : (
												'Extend life'
											)}
										</SubmitButton>
									</Box>
								</Tooltip>
							</Box>
							<Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
								<Typography variant="caption">Cost: {fee} CTIM</Typography>
							</Box>
						</div>
					</Fade>
				</DialogContent>
			</Dialog>
			<LifelineDoneDialog open={open && isDone} onClose={handleClose} />
		</>
	)
}
