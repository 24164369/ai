import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/client/components/ui/avatar';
import { cn } from '@/client/lib/utils';
import type { UIMessage } from 'ai';
import type { ComponentProps, HTMLAttributes } from 'react';

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role'];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-start gap-4 py-6',
      from === 'user' ? 'is-user justify-end' : 'is-assistant justify-start',
      className
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      'flex flex-col gap-3 overflow-hidden rounded-2xl px-5 py-4 text-sm leading-relaxed max-w-[85%]',
      'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:ml-auto',
      'group-[.is-assistant]:bg-muted group-[.is-assistant]:text-foreground group-[.is-assistant]:mr-auto',
      'shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar
    className={cn('size-9 ring-2 ring-border shrink-0', className)}
    {...props}
  >
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback className="text-xs font-semibold">
      {name?.slice(0, 2).toUpperCase() || 'AI'}
    </AvatarFallback>
  </Avatar>
);