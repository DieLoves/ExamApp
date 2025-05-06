import { JSX } from 'react';
import { AlertDialogCustom } from './custom-alert-dialog';

export function ProductInfoDialog({ trigger }: { trigger: JSX.Element }) {
	return (
		<AlertDialogCustom
			button={{
				trigger,
				action: { name: 'Окей' },
			}}
			dialog={{ title: 'Информация о приложении', description: 'Что-то...' }}
		/>
	);
}
