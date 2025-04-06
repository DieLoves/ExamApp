import type { ReactNode } from 'react';

interface AppFooterProps {
	children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
	return (
		<footer className='sticky bottom-0 z-10 bg-background/80 backdrop-blur-sm border-t p-4 flex flex-wrap justify-between gap-2 mt-auto'>
			{children}
		</footer>
	);
}
