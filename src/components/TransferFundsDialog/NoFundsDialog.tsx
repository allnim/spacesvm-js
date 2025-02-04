import {Twemoji} from 'react-emoji-render'
import {Box, Button, Dialog, DialogContent, Grow, Typography} from '@mui/material'

import {DialogTitle} from '@/components/DialogTitle'

type NoFundsDialogProps = {
	open: boolean
	onClose(): void
}

export const NoFundsDialog = ({ open, onClose }: NoFundsDialogProps) => (
	<Dialog open={open} maxWidth="xs" onClose={onClose} TransitionComponent={Grow}>
		<DialogTitle onClose={onClose}>
			<Typography variant="h3" align="center" fontFamily="DM Serif Display">
				Your pockets are empty!&nbsp;
				<Twemoji svg text=":cry:" />
				<span style={{ position: 'absolute', fontSize: 36, transform: 'translateX(8px) translateY(-3px)' }}>
					<Twemoji svg text=":cry:" />
				</span>
			</Typography>
		</DialogTitle>
		<DialogContent>
			<Typography color="textSecondary" align="center">
				You're out of Copyright Tokens...
			</Typography>
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
				<Button color="secondary" size="small" variant="outlined" onClick={onClose} sx={{ display: 'flex' }}>
					Close
				</Button>
			</Box>
		</DialogContent>
	</Dialog>
)
