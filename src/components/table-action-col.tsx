import toast from 'react-hot-toast';
import ClipboardCopy from 'lucide-react/dist/esm/icons/clipboard-copy';
import DownloadIcon from 'lucide-react/dist/esm/icons/download';
import MoreVertical from 'lucide-react/dist/esm/icons/more-vertical';
import Telescope from 'lucide-react/dist/esm/icons/telescope';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';

import { Button } from '@/components/ui/button';
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export const TableActionCol = ({ children }: { children: React.ReactNode }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
};

const Copy = ({
  children = 'Copy',
  textToCopy,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  textToCopy: string;
}) => {
  return (
    <DropdownMenuItem
      onClick={(e) => {
        navigator.clipboard.writeText(textToCopy);
        toast.success('Copied to clipboard');
        if (props?.onClick) props?.onClick(e);
      }}
      {...props}
    >
      <ClipboardCopy />
      {children}
    </DropdownMenuItem>
  );
};

TableActionCol.Copy = Copy;

const View = ({
  children = 'View',
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) => {
  return (
    <DropdownMenuItem {...props}>
      <Telescope />
      {children}
    </DropdownMenuItem>
  );
};

TableActionCol.View = View;

const Download = ({
  children = 'Download',
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) => {
  return (
    <DropdownMenuItem {...props}>
      <DownloadIcon />
      {children}
    </DropdownMenuItem>
  );
};

TableActionCol.Download = Download;

const Delete = ({
  children = 'Delete',
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) => {
  return (
    <DropdownMenuItem {...props}>
      <Trash2 />
      {children}
    </DropdownMenuItem>
  );
};

TableActionCol.Delete = Delete;
