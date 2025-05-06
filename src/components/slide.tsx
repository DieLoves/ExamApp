import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type React from 'react';

type SliderProps = React.ComponentProps<typeof Slider>;

export function SliderDemo({ className, ...props }: SliderProps) {
	return <Slider className={cn('w-full', className)} {...props} />;
}
