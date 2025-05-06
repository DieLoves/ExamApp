import { APP_NAME } from '@/config';
import { message } from '@tauri-apps/plugin-dialog';

type Kind = 'info' | 'warning' | 'error';
export async function alertMessage(textMessage: string, kind: Kind = 'info') {
	await message(textMessage, {
		kind,
		title: `ExamApp. ${APP_NAME}`,
	});
}
