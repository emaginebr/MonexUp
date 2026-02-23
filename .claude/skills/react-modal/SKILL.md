---
name: react-modal
description: Create modal dialogs in the frontend using react-bootstrap Modal component. Use this skill whenever the user asks to create, add, or modify a modal, dialog, popup, or confirmation prompt in the React application.
---

This skill defines the standard approach for creating modal dialogs in this project. All modals MUST use the react-bootstrap `Modal` component — the project does NOT use Radix UI, Tailwind, or any custom modal library.

## Rules

1. **Always use react-bootstrap `Modal`** for any modal, dialog, or popup.
2. **Never use `window.alert()`, `window.confirm()`, or `window.prompt()`** — use `MessageToast` for alerts (see `react-alert` skill) and `Modal` for dialogs.
3. **Never use Radix UI, MUI Dialog, or other modal libraries** — react-bootstrap Modal is the standard.
4. **Always use controlled state** — modals are controlled via `show` prop and `onHide` callback.
5. **Always define a props interface** for modal components.
6. **Always place modals in `src/Components/`** as reusable components.

## Imports

```tsx
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/esm/Button';
```

## Reference Implementation

The existing `ImageModal` at `src/Components/ImageModal.tsx` is the reference for all modals in this project.

## Modal Component Template

**File**: `src/Components/{Name}Modal.tsx`

```tsx
import { useContext, useState } from "react";
import Button from 'react-bootstrap/esm/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useTranslation } from "react-i18next";

interface I{Name}ModalParam {
    show: boolean;
    onClose: () => void;
    onSuccess?: (result: any) => void;
    // Add entity-specific props here
}

export default function {Name}Modal(param: I{Name}ModalParam) {
    const { t } = useTranslation();

    // Local state for form fields, loading, etc.
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Perform the action (API call via context, etc.)
            // await someContext.someMethod(data);

            if (param.onSuccess) {
                param.onSuccess(/* result data */);
            }
            param.onClose();
        } catch (err) {
            // Handle error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={param.show} size="lg" onHide={param.onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{t('modal_title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Modal content: forms, text, images, etc. */}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('field_label')}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={t('field_placeholder')}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={param.onClose}>
                    {t('close')}
                </Button>
                <Button
                    variant="primary"
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {loading ? t('loading') : t('save')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
```

## Props Interface Pattern

```tsx
interface I{Name}ModalParam {
    show: boolean;                      // Controls modal visibility
    onClose: () => void;               // Called when modal is dismissed
    onSuccess?: (result: any) => void; // Called after successful action
    // Entity-specific props:
    entityId?: number;                 // For edit modals
    entity?: EntityInfo;               // For pre-populated forms
}
```

## Usage in Pages

### Opening a modal

```tsx
import { useState } from "react";
import {Name}Modal from "../../Components/{Name}Modal";

export default function SomePage() {
    const [showModal, setShowModal] = useState<boolean>(false);

    return (
        <>
            {/* Trigger button */}
            <Button onClick={() => setShowModal(true)}>
                Open Modal
            </Button>

            {/* Modal component */}
            <{Name}Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={(result) => {
                    // Handle success (e.g., refresh data, show toast)
                }}
            />
        </>
    );
}
```

### Confirmation modal pattern

For "Are you sure?" type confirmations, create a simple confirmation modal:

```tsx
import { useState } from "react";
import Button from 'react-bootstrap/esm/Button';
import Modal from 'react-bootstrap/Modal';
import { useTranslation } from "react-i18next";

interface IConfirmModalParam {
    show: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    confirmVariant?: string;  // "danger", "warning", "success", etc.
}

export default function ConfirmModal(param: IConfirmModalParam) {
    const { t } = useTranslation();

    return (
        <Modal show={param.show} onHide={param.onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{param.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{param.message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={param.onClose}>
                    {t('cancel')}
                </Button>
                <Button
                    variant={param.confirmVariant || "danger"}
                    disabled={param.loading}
                    onClick={param.onConfirm}
                >
                    {param.loading ? t('loading') : t('confirm')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
```

Usage:
```tsx
const [showConfirm, setShowConfirm] = useState<boolean>(false);
const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

const handleDelete = async () => {
    setDeleteLoading(true);
    let ret = await someContext.delete(entityId);
    setDeleteLoading(false);
    if (ret.sucesso) {
        setShowConfirm(false);
        throwSuccess(t(ret.mensagemSucesso));
    } else {
        throwError(ret.mensagemErro);
    }
};

<ConfirmModal
    show={showConfirm}
    title={t('confirm_delete_title')}
    message={t('confirm_delete_message')}
    onClose={() => setShowConfirm(false)}
    onConfirm={handleDelete}
    loading={deleteLoading}
    confirmVariant="danger"
/>
```

## Modal Sizes

react-bootstrap Modal supports these sizes via the `size` prop:

```tsx
<Modal show={show} size="sm" onHide={onClose}>   {/* Small */}
<Modal show={show} onHide={onClose}>              {/* Default (medium) */}
<Modal show={show} size="lg" onHide={onClose}>    {/* Large */}
<Modal show={show} size="xl" onHide={onClose}>    {/* Extra large */}
```

## Modal Structure

```
<Modal>
├── <Modal.Header closeButton>
│   └── <Modal.Title>Title</Modal.Title>
├── <Modal.Body>
│   └── (content: forms, text, images, etc.)
└── <Modal.Footer>
    ├── <Button variant="secondary">Cancel</Button>
    └── <Button variant="primary">Action</Button>
```

## Key Conventions

- Props parameter is named `param`, not destructured
- Use `param.show`, `param.onClose`, `param.onSuccess` pattern
- Loading state disables the action button
- Action button text changes to loading text when disabled
- `closeButton` on `Modal.Header` for the X close button
- `onHide` prop on `Modal` maps to `param.onClose`
- Use `useTranslation()` for all user-facing text
- Modal body can contain any content: forms, tables, images, text
