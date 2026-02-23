---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

This skill guides creation of frontend pages and components in the MonexUp React application. All code MUST use the project's established tech stack and patterns.

## Tech Stack

- **React 18** with TypeScript (Create React App)
- **react-bootstrap 5** (`react-bootstrap`) — Primary UI framework
- **Bootstrap 5** (`bootstrap`) — CSS framework
- **Material-UI 6** (`@mui/material`, `@mui/icons-material`) — Advanced components and icons
- **FontAwesome** (`@fortawesome/react-fontawesome`) — Icon library
- **i18next** (`react-i18next`) — Internationalization
- **react-loading-skeleton** — Loading states
- **react-router-dom v6** — Routing and navigation
- **Global CSS** files (`App.css`, `bootstrap.css`) — No CSS modules, no Tailwind, no styled-components

## Rules

1. **Always use react-bootstrap components** for layout and UI elements (Container, Row, Col, Card, Form, Button, Table, etc.).
2. **Always use `useTranslation()`** from `react-i18next` for all user-facing text. Add translation keys to `public/locales/{lang}/translation.json` (pt, en, es, fr).
3. **Never use Tailwind CSS classes** — this project uses Bootstrap utility classes only.
4. **Never use CSS modules or styled-components** — use global CSS or inline styles for custom styling.
5. **Always use FontAwesome** for inline icons: `<FontAwesomeIcon icon={faIconName} fixedWidth />`.
6. **Always use `react-loading-skeleton`** or the `SkeletonPage` component for loading states.
7. **Always use `useContext()`** to access data from providers — never call services/business directly from components.
8. **Always use `useNavigate()`** from `react-router-dom` for programmatic navigation.

## Page Structure

All pages follow this pattern:

```tsx
import { useContext, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MessageToast from "../../Components/MessageToast";
import { MessageToastEnum } from "../../DTO/Enum/MessageToastEnum";
import SomeContext from "../../Contexts/Some/SomeContext";

export default function SomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const someContext = useContext(SomeContext);

    // Toast state (see react-alert skill)
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");
    const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);

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

    // Loading state
    if (someContext.loading) {
        return <SkeletonPage />;
    }

    return (
        <>
            <MessageToast
                dialog={dialog}
                showMessage={showMessage}
                messageText={messageText}
                onClose={() => setShowMessage(false)}
            />
            <Container className="py-5">
                <Row>
                    <Col md={8} className="offset-md-2">
                        <Card>
                            <Card.Header>
                                <h3 className="text-center">{t('page_title')}</h3>
                            </Card.Header>
                            <Card.Body>
                                {/* Page content */}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
```

**Key points:**
- Pages are in `src/Pages/{PageName}/index.tsx`
- Reusable components are in `src/Components/`
- Use `Container > Row > Col` for grid layout
- Use `Card` for content sections
- Use `offset-md-*` for centering columns

## Form Pattern

```tsx
<Form>
    <Form.Group as={Row} className="mb-3">
        <Form.Label column sm="3">{t('field_label')}:</Form.Label>
        <Col sm="9">
            <InputGroup>
                <InputGroup.Text>
                    <FontAwesomeIcon icon={faUser} fixedWidth />
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    size="lg"
                    placeholder={t('field_placeholder')}
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                />
            </InputGroup>
        </Col>
    </Form.Group>
    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <Button variant="secondary" size="lg" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faClose} fixedWidth /> {t('cancel')}
        </Button>
        <Button variant="success" size="lg" disabled={someContext.loadingUpdate} onClick={handleSave}>
            <FontAwesomeIcon icon={faSave} fixedWidth /> {someContext.loadingUpdate ? t('loading') : t('save')}
        </Button>
    </div>
</Form>
```

## Table/List Pattern

```tsx
<Table striped bordered hover responsive>
    <thead>
        <tr>
            <th>{t('column_name')}</th>
            <th>{t('column_status')}</th>
            <th>{t('column_actions')}</th>
        </tr>
    </thead>
    <tbody>
        {items.map((item) => (
            <tr key={item.itemId}>
                <td>{item.name}</td>
                <td>{/* status badge */}</td>
                <td>
                    <Button variant="primary" size="sm" onClick={() => navigate(`/path/${item.itemId}`)}>
                        <FontAwesomeIcon icon={faEdit} fixedWidth />
                    </Button>
                </td>
            </tr>
        ))}
    </tbody>
</Table>
```

## Component Imports Reference

```tsx
// Layout
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";

// UI Components
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/esm/Button";
import Table from "react-bootstrap/esm/Table";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

// Form Components
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash, faEdit, faPlus, faSearch, faClose, faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

// Navigation
import { useNavigate, useParams, Link } from "react-router-dom";

// i18n
import { useTranslation } from "react-i18next";

// Loading skeleton
import Skeleton from "react-loading-skeleton";
import SkeletonPage from "../../Components/SkeletonPage";
```

## Handling Context Results

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

## Design Guidelines

- Use Bootstrap's spacing utilities (`mb-3`, `py-5`, `mt-2`, etc.)
- Use Bootstrap's text utilities (`text-center`, `text-danger`, `text-muted`)
- Use `rounded-circle` for circular images with inline width/height styles
- Use `d-grid gap-2 d-md-flex justify-content-md-end` for button groups
- Use `Card` with `Card.Header` + `Card.Body` for content sections
- Use `Badge` for status indicators with variant colors
- Keep pages responsive using Bootstrap grid (`md`, `sm`, `lg` breakpoints)
