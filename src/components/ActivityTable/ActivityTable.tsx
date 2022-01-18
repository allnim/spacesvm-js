import { Twemoji } from 'react-emoji-render'
import { Link } from 'react-router-dom'
import { Box, Link as MuiLink, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

import { AddressChip } from '@/components/AddressChip/AddressChip'
import { getLatestActivity } from '@/utils/spacesVM'

export const ActivityTable = memo(() => {
	const [recentActivity, setRecentActivity] = useState<
		{
			timestamp?: number
			to?: string
			txId?: string
			type?: string
			sender?: string
			space?: string
			units?: number
		}[]
	>()

	useEffect(() => {
		const fetchRecentActivity = async () => {
			const activity = await getLatestActivity()
			console.log(activity)
			setRecentActivity(activity.activity)
		}

		fetchRecentActivity()

		setInterval(() => {
			fetchRecentActivity()
		}, 10000) // refresh every 10s
	}, [])

	return recentActivity ? (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							Type
						</Typography>
					</TableCell>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							Key
						</Typography>
					</TableCell>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							Space
						</Typography>
					</TableCell>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							Sender
						</Typography>
					</TableCell>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							To
						</Typography>
					</TableCell>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							Transaction ID
						</Typography>
					</TableCell>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							Cost{' '}
							<Typography sx={{ ml: 1 }} variant="body2" component="span" color="textSecondary">
								(SPC)
							</Typography>
						</Typography>
					</TableCell>
					<TableCell>
						<Typography fontFamily="DM Serif Display" variant="h6">
							Time
						</Typography>
					</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{recentActivity?.map(
					({ timestamp, to, txId, key, sender, space, units, type }, i) =>
						i <= 20 && (
							<TableRow key={`${txId}-${i}`}>
								<TableCell>
									<Typography noWrap variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
										{type ? (
											<>
												{type === 'claim' && (
													<>
														<Box display="inline-flex" mr={1} fontSize={24}>
															<Twemoji svg text="📜" />
														</Box>
														Claim
													</>
												)}

												{type === 'lifeline' && (
													<>
														<Box display="inline-flex" mr={1} fontSize={24}>
															<Twemoji svg text="⌛️" />
														</Box>
														Lifeline
													</>
												)}

												{type === 'delete' && (
													<>
														<Box display="inline-flex" mr={1} fontSize={24}>
															<Twemoji svg text="🚮" />
														</Box>
														Delete
													</>
												)}

												{type === 'reward' && (
													<>
														<Box display="inline-flex" mr={1} fontSize={24} position="relative" top={1}>
															<Twemoji svg text="🤑" />
														</Box>
														Reward
													</>
												)}

												{type === 'move' && (
													<>
														<Box display="inline-flex" mr={1} fontSize={24} position="relative" top={2}>
															<Twemoji svg text="📦" />
														</Box>
														Move
													</>
												)}

												{type === 'set' && (
													<>
														<Box display="inline-flex" mr={1} fontSize={24}>
															<Twemoji svg text="✍️" />
														</Box>
														Set
													</>
												)}

												{type === 'transfer' && (
													<>
														<Box display="inline-flex" mr={1} fontSize={24}>
															<Twemoji svg text="📃" />
														</Box>
														Transfer
													</>
												)}
											</>
										) : (
											'-'
										)}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography noWrap variant="body2">
										{key && space ? (
											<MuiLink component={Link} to={`/s/${space}/${key}/`}>
												{key}
											</MuiLink>
										) : (
											'-'
										)}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography noWrap variant="body2">
										{space ? (
											<MuiLink component={Link} to={`/s/${space}/`}>
												{space}
											</MuiLink>
										) : (
											'-'
										)}
									</Typography>
								</TableCell>
								<TableCell>
									{sender ? <AddressChip address={sender} isObfuscated tooltipPlacement="top" /> : '-'}
								</TableCell>
								<TableCell>{to ? <AddressChip address={to} isObfuscated tooltipPlacement="top" /> : '-'}</TableCell>
								<TableCell>
									{txId ? (
										<AddressChip
											copyText="Copy TxID"
											copySuccessText="TxID copied!"
											address={txId}
											isObfuscated
											tooltipPlacement="top"
										/>
									) : (
										'-'
									)}
								</TableCell>
								<TableCell>
									<Typography noWrap variant="body2">
										{units ? new Intl.NumberFormat('en-US').format(units) : '-'}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography noWrap variant="body2">
										{new Date(Number(timestamp) * 1000).toLocaleString() || '-'}
									</Typography>
								</TableCell>
							</TableRow>
						),
				)}
			</TableBody>
		</Table>
	) : (
		<Box height={400} />
	)
})
