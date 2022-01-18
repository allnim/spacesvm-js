import { Twemoji } from 'react-emoji-render'
import { GiCardboardBox } from 'react-icons/gi'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
	Box,
	Button,
	Grid,
	Grow,
	LinearProgress,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Tooltip,
	Typography,
	useTheme,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'

import { ClaimButton } from '../Home/Home'
import { SpaceKeyValueRow } from './SpaceKeyValue'

import NothingHere from '@/assets/nothing-here.jpg'
import { AddressChip } from '@/components/AddressChip/AddressChip'
import { KeyValueInput } from '@/components/KeyValueInput'
import { LifelineDialog } from '@/components/LifelineDialog'
import { MoveSpaceDialog } from '@/components/MoveSpaceDialog'
import { Page } from '@/components/Page'
import { PageTitle } from '@/components/PageTitle'
import { USERNAME_REGEX_QUERY } from '@/constants'
import { useMetaMask } from '@/providers/MetaMaskProvider'
import { rainbowText } from '@/theming/rainbowText'
import { querySpace } from '@/utils/spacesVM'

export const SpaceDetails = memo(() => {
	const navigate = useNavigate()
	const { spaceId } = useParams()
	const { currentAddress } = useMetaMask()
	const theme = useTheme()
	const [details, setDetails] = useState<any>()
	const [showDetailsTable, setShowDetailsTable] = useState<boolean>(false)
	const [spaceValues, setSpaceValues] = useState<any>()
	const [loading, setLoading] = useState<boolean>(true)
	const spaceIdTrimmed = spaceId?.toLowerCase().replace(USERNAME_REGEX_QUERY, '')
	const [lifelineDialogOpen, setLifelineDialogOpen] = useState<boolean>(false)
	const [moveDialogOpen, setMoveDialogOpen] = useState<boolean>(false)

	const refreshSpaceDetails = useCallback(async () => {
		if (!spaceId) return
		const spaceData = await querySpace(spaceId || '')
		setDetails(spaceData?.info)
		setSpaceValues(spaceData?.values)
		setLoading(false)
	}, [spaceId])

	useEffect(() => {
		refreshSpaceDetails()
	}, [refreshSpaceDetails])

	useEffect(() => {
		!spaceId?.length && navigate('/')
	}, [spaceId, navigate])

	const isSpaceOwner = useMemo(() => details?.owner === currentAddress, [details, currentAddress])

	return (
		<Page title={spaceIdTrimmed} showFooter={false} noPadding>
			<Box style={{ paddingTop: 64 }}>
				{loading ? (
					<LinearProgress color="secondary" />
				) : (
					<Grid container>
						<Grid
							item
							xs={12}
							md={5}
							sx={{
								height: {
									xs: 'unset',
									md: 'calc(100vh - 64px)',
								},
								p: 2,
								pb: 4,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<PageTitle align="center" variant="h2" sx={{ mb: 0 }}>
								<Twemoji svg text="✨🔭" />
							</PageTitle>
							<PageTitle
								align="center"
								variant="h1"
								sx={{
									...rainbowText,
									mb: 0,
								}}
							>
								{spaceIdTrimmed}
							</PageTitle>
							{details && (
								<>
									<Tooltip title={new Date(details.expiry * 1000).toLocaleString()} placement="right">
										<Typography
											sx={{
												py: 1,
												'&:hover': {
													cursor: 'help',
												},
											}}
											variant="caption"
											component="div"
											display="block"
											align="center"
											color="textSecondary"
										>
											<Grid container alignItems="center" spacing={1}>
												{isSpaceOwner && (
													<>
														<Grid item>Owned by you</Grid>
														<Grid item>—</Grid>
													</>
												)}
												<Grid item>
													Expires {formatDistanceToNow(new Date(details.expiry * 1000), { addSuffix: true })}
												</Grid>
												<Grid item sx={{ display: 'flex', mt: '0px' }}>
													<IoInformationCircleOutline size={14} />
												</Grid>
											</Grid>
										</Typography>
									</Tooltip>

									<Grid container sx={{ mt: 2 }} alignItems="center" justifyContent="center" spacing={1}>
										<Grid item>
											<Button variant="outlined" color="secondary" onClick={() => setLifelineDialogOpen(true)}>
												Extend expiration date
											</Button>
										</Grid>
										<Grid item>
											<Button color="secondary" onClick={() => setShowDetailsTable(!showDetailsTable)}>
												{showDetailsTable ? 'Hide' : 'Show'} details
											</Button>
										</Grid>
									</Grid>

									<Grow in={showDetailsTable} mountOnEnter unmountOnExit>
										<div>
											<Table sx={{ mt: 2 }}>
												<TableBody>
													<TableRow>
														<TableCell>Owner</TableCell>
														<TableCell>
															<AddressChip sx={{ ml: -1 }} address={details.owner} />
														</TableCell>
													</TableRow>
													<TableRow>
														<TableCell sx={{ whiteSpace: 'nowrap' }}>Created on</TableCell>
														<TableCell>{new Date(details.created * 1000).toLocaleString()}</TableCell>
													</TableRow>
													<TableRow>
														<TableCell sx={{ whiteSpace: 'nowrap' }}>Last updated on</TableCell>
														<TableCell>{new Date(details.lastUpdated * 1000).toLocaleString()}</TableCell>
													</TableRow>
												</TableBody>
											</Table>
											{isSpaceOwner && (
												<Box sx={{ display: 'flex', justifyContent: 'end', mt: 2 }}>
													<Button
														startIcon={<GiCardboardBox />}
														variant="outlined"
														color="secondary"
														size="small"
														sx={{
															background: theme.customPalette.customBackground,
															'&:hover': { background: theme.customPalette.customBackground },
														}}
														onClick={() => setMoveDialogOpen(true)}
													>
														Move space
													</Button>
												</Box>
											)}
										</div>
									</Grow>
								</>
							)}
						</Grid>
						<Grid
							item
							xs={12}
							md={7}
							sx={{
								p: {
									xs: 2,
									md: 8,
								},
								background: (theme) => theme.palette.background.paper,
								backgroundImage: (theme) =>
									theme.palette.mode === 'dark' && spaceValues?.length === 0 ? `url(${NothingHere})` : 'unset',
								backgroundSize: 'cover',
								backgroundRepeat: 'no-repeat',
								backgroundPosition: 'center',
								borderTopLeftRadius: 24,
								borderBottomLeftRadius: 24,
								boxShadow: '-90px 0 200px 0 rgb(82 61 241 / 6%)',
								overflow: 'auto',
								height: 'calc(100vh - 64px)',
							}}
						>
							{spaceValues && (
								<Typography variant="h3" fontFamily="DM Serif Display" align="center" gutterBottom>
									Space contents
								</Typography>
							)}

							{spaceValues && (
								<Typography
									variant="body1"
									component="div"
									color="textSecondary"
									align="center"
									gutterBottom
									sx={{ mb: 3 }}
								>
									{spaceValues?.length === 0 ? (
										`There's nothing in ${isSpaceOwner ? 'your' : 'this'} space right now.`
									) : (
										<Typography variant="body2" color="textSecondary">
											The{' '}
											<Typography component="b" fontWeight={900} variant="body2" color="textPrimary">
												more
											</Typography>{' '}
											items in {isSpaceOwner ? 'your' : 'a'} space, the{' '}
											<Typography component="b" fontWeight={900} variant="body2" color="textPrimary">
												faster
											</Typography>{' '}
											it will expire.
										</Typography>
									)}
								</Typography>
							)}

							{spaceId && isSpaceOwner && (
								<KeyValueInput
									empty={spaceValues?.length === 0 || !spaceValues}
									spaceId={spaceId}
									refreshSpaceDetails={refreshSpaceDetails}
								/>
							)}

							{spaceValues ? (
								spaceValues.map(({ key, valueMeta }: any) => {
									if (!spaceId) return
									return (
										<SpaceKeyValueRow
											key={key}
											spaceId={spaceId}
											spaceKey={key}
											isSpaceOwner={isSpaceOwner}
											refreshSpaceDetails={refreshSpaceDetails}
											lastTouchTxId={valueMeta.txId}
										/>
									)
								})
							) : (
								<Box display="flex" height="100%" flexDirection="column" justifyContent="center" alignItems="center">
									<Typography sx={{ mb: 4 }} variant="h3" align="center" fontFamily="DM Serif Display">
										This space hasn't been claimed yet!
									</Typography>
									<ClaimButton
										//@ts-ignore
										component={Link}
										to={`/?ref=${spaceId}`}
										fullWidth
										variant="contained"
										size="large"
									>
										Claim it now!
									</ClaimButton>
								</Box>
							)}
						</Grid>
					</Grid>
				)}
			</Box>

			{details?.expiry && (
				<LifelineDialog
					open={lifelineDialogOpen}
					close={() => setLifelineDialogOpen(false)}
					existingExpiry={details.expiry}
					spaceUnits={details.units}
					refreshSpaceDetails={refreshSpaceDetails}
				/>
			)}

			<MoveSpaceDialog
				open={moveDialogOpen}
				onClose={() => setMoveDialogOpen(false)}
				refreshSpaceDetails={refreshSpaceDetails}
			/>
		</Page>
	)
})
