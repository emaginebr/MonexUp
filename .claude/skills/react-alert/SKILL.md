---
name: react-alert
description: Display user-facing alerts, notifications, and feedback messages using the MessageToast component built on react-bootstrap Toast. Use this skill whenever the user asks to show an alert, notification, success message, error message, warning, or any kind of user feedback popup.
---

This skill defines the standard approach for displaying alerts, notifications, and user feedback in this project. All alerts MUST use the `MessageToast` component — never native browser alerts.

## Component Location

- **MessageToast**: `src/Components/MessageToast.tsx`
- **MessageToastEnum**: `src/DTO/Enum/MessageToastEnum.tsx`

## Rules

1. **Always use `MessageToast`** for any user-facing alert, notification, or feedback message.
2. **Never use `window.alert()`** — use `MessageToast` with `MessageToastEnum.Error` or `MessageToastEnum.Information`.
3. **Never use `window.confirm()`** — use `MessageToast` with `MessageToastEnum.Confirmation` and `onYes`/`onNo` callbacks.
4. **Never use `window.prompt()`** — use a Modal with a form input instead (see `react-modal` skill).
5. **Never create custom alert/notification components** — the `MessageToast` system already handles this.
6. **Always use `useTranslation()`** for translatable messages.

## MessageToastEnum

```typescript
// src/DTO/Enum/MessageToastEnum.tsx
export enum MessageToastEnum {
    Error = 0,        // Red warning icon
    Success = 1,      // Green checkmark icon
    Information = 2,  // Blue info icon
    Confirmation = 3  // Question icon with Yes/No buttons
}
```

## Setup Pattern

Every page that needs alerts must include these 3 state variables, helper functions, and the `MessageToast` JSX:

```tsx
import { useState } from "react";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import { useTranslation } from "react-i18next";

export default function SomePage() {
    const { t } = useTranslation();

    // --- Toast State ---
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");
    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);

    // --- Toast Helpers ---
    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };

    const throwSuccess = (message: string) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(message);
        setShowMessage(true);
    };

    const throwInfo = (message: string) => {
        setDialog(MessageToastEnum.Information);
        setMessageText(message);
        setShowMessage(true);
    };

    return (
        <>
            {/* Toast MUST be placed at the top of the JSX, outside the main Container */}
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
            {/* ... rest of page content ... */}
        </>
    );
}
```

## Usage Patterns

### Error feedback after a failed operation

```tsx
const handleSave = async () => {
    let ret = await someContext.update(data);
    if (ret.sucesso) {
        throwSuccess(t(ret.mensagemSucesso));
    } else {
        throwError(ret.mensagemErro);
    }
};
```

### Validation errors before calling the API

```tsx
const handleSubmit = async () => {
    if (!name) {
        throwError(t('error_name_required'));
        return;
    }
    if (!email) {
        throwError(t('error_email_required'));
        return;
    }
    // proceed with API call...
};
```

### Confirmation dialog with Yes/No

For confirmation prompts (e.g., "Are you sure you want to delete?"), use `MessageToastEnum.Confirmation` with `onYes` and `onNo` callbacks:

```tsx
export default function SomePage() {
    const { t } = useTranslation();

    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");
    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);

    // Store what action to take on confirmation
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const throwError = (message: string) => {
        setDialog(MessageToastEnum.Error);
        setMessageText(message);
        setShowMessage(true);
    };

    const throwSuccess = (message: string) => {
        setDialog(MessageToastEnum.Success);
        setMessageText(message);
        setShowMessage(true);
    };

    const askConfirmation = (message: string, onConfirm: () => void) => {
        setDialog(MessageToastEnum.Confirmation);
        setMessageText(message);
        setPendingAction(() => onConfirm);
        setShowMessage(true);
    };

    const handleDelete = (itemId: number) => {
        askConfirmation(t('confirm_delete'), async () => {
            let ret = await someContext.delete(itemId);
            if (ret.sucesso) {
                throwSuccess(t(ret.mensagemSucesso));
            } else {
                throwError(ret.mensagemErro);
            }
        });
    };

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
                onYes={() => {
                    setShowMessage(false);
                    if (pendingAction) pendingAction();
                }}
                onNo={() => setShowMessage(false)}
            />
            {/* ... page content ... */}
        </>
    );
}
```

## MessageToast Props Reference

```typescript
interface IMessageToastParam {
    dialog: MessageToastEnum;      // Toast type (Error, Success, Information, Confirmation)
    showMessage: boolean;          // Whether to show the toast
    messageText: string;           // Message to display
    onClose: () => void;           // Called when toast is dismissed
    onYes?: () => void;            // Called when "Yes" is clicked (Confirmation only)
    onNo?: () => void;             // Called when "No" is clicked (Confirmation only)
}
```

## Integration with ProviderResult

Context methods return `ProviderResult`:

```typescript
interface ProviderResult {
    sucesso: boolean;          // Whether the operation succeeded
    mensagemErro: string;      // Error message (show directly)
    mensagemSucesso: string;   // Success message key (pass through t() for translation)
}
```

Standard pattern:
```tsx
let ret = await context.someMethod(data);
if (ret.sucesso) {
    throwSuccess(t(ret.mensagemSucesso));  // Translate the success key
} else {
    throwError(ret.mensagemErro);          // Show error directly
}
```
