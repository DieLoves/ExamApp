import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { JSX } from 'react';

type ButtonProps = {
	trigger: JSX.Element;
	cancel?: {
		name: string;
		onClick?: () => void;
	};
	action?: {
		name: string;
		onClick?: () => void;
	};
};

type DialogProps = {
	title: string;
	description?: string;
};

type AlertDialogCustomProps = {
	button: ButtonProps;
	dialog: DialogProps;
};

export function AlertDialogCustom({ button, dialog }: AlertDialogCustomProps) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{button.trigger}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className='text-1xl sm:text-xl'>
						{dialog.title}
					</AlertDialogTitle>
					{dialog.description && (
						<AlertDialogDescription className='text-base sm:text-xl'>
							{dialog.description}
						</AlertDialogDescription>
					)}
				</AlertDialogHeader>
				<AlertDialogFooter>
					{button.cancel && (
						<AlertDialogCancel
							className='text-lg'
							onClick={button.cancel.onClick}
						>
							{button.cancel.name}
						</AlertDialogCancel>
					)}
					{button.action && (
						<AlertDialogAction
							className='text-lg'
							onClick={button.action.onClick}
						>
							{button.action.name}
						</AlertDialogAction>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
