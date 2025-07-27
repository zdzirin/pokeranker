"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

type ResponsiveDialogContextValue = {
  isDesktop: boolean;
};

const ResponsiveDialogContext = React.createContext<
  ResponsiveDialogContextValue | undefined
>(undefined);

const useResponsiveDialogContext = () => {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "useResponsiveDialogContext must be used within a ResponsiveDialog",
    );
  }
  return context;
};

function ResponsiveDialog({
  children,
  ...props
}: React.ComponentProps<typeof Dialog> | React.ComponentProps<typeof Drawer>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ResponsiveDialogContext.Provider value={{ isDesktop }}>
      {isDesktop ? (
        <Dialog {...(props as React.ComponentProps<typeof Dialog>)}>
          {children}
        </Dialog>
      ) : (
        <Drawer {...(props as React.ComponentProps<typeof Drawer>)}>
          {children}
        </Drawer>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

function ResponsiveDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogTrigger {...props} />;
  }

  return <DrawerTrigger {...props} />;
}

function ResponsiveDialogClose({
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogClose {...props} />;
  }

  return <DrawerClose {...props} />;
}

const ResponsiveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ ...props }, ref) => {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogContent {...props} ref={ref} />;
  }

  const { showCloseButton, ...drawerProps } = props;
  return <DrawerContent {...drawerProps} ref={ref as any} />;
});
ResponsiveDialogContent.displayName = "ResponsiveDialogContent";

function ResponsiveDialogHeader({
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogHeader {...props} />;
  }

  return <DrawerHeader {...props} />;
}

function ResponsiveDialogFooter({
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogFooter {...props} />;
  }

  return <DrawerFooter {...props} />;
}

const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogTitle>,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ ...props }, ref) => {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogTitle {...props} ref={ref} />;
  }

  return <DrawerTitle {...props} ref={ref as any} />;
});
ResponsiveDialogTitle.displayName = "ResponsiveDialogTitle";

const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogDescription>,
  React.ComponentPropsWithoutRef<typeof DialogDescription>
>(({ ...props }, ref) => {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogDescription {...props} ref={ref} />;
  }

  return <DrawerDescription {...props} ref={ref as any} />;
});
ResponsiveDialogDescription.displayName = "ResponsiveDialogDescription";

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
};
