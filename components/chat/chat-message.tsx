import { ChatHistoryItem } from '@/lib/ai';
import { cn } from '@/lib/utils';
import { Fragment } from 'react';
import Moment from 'react-moment';

interface ChatMessageProps {
  message: ChatHistoryItem;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('ps-2 flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 text-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message?.parts?.map((part, index) => (
          <Fragment key={index}>
            {typeof part.text !== 'undefined' && (
              <p
                dangerouslySetInnerHTML={{
                  __html: part.text.replaceAll('```html', '').replaceAll('```', '') || '',
                }}
              />
            )}
          </Fragment>
        ))}
        <p className="mt-1 text-xs opacity-50">
          <Moment date={message.timestamp} format="HH:mm MMM DD" />
        </p>
      </div>
    </div>
  );
}
