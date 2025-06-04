--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0 (Debian 17.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-04 08:48:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

--CREATE SCHEMA public;


--ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3570 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

--COMMENT ON SCHEMA public IS 'standard public schema';


--SET default_tablespace = '';

--SET default_table_access_method = heap;

--
-- TOC entry 239 (class 1259 OID 25325)
-- Name: invoice_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_fees (
    fee_id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    network_id bigint,
    user_id bigint,
    amount double precision DEFAULT 0 NOT NULL,
    paid_at timestamp without time zone
);


--ALTER TABLE public.invoice_fees OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 25324)
-- Name: invoice_commission_commission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_commission_commission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.invoice_commission_commission_id_seq OWNER TO postgres;

--
-- TOC entry 3571 (class 0 OID 0)
-- Dependencies: 238
-- Name: invoice_commission_commission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_commission_commission_id_seq OWNED BY public.invoice_fees.fee_id;


--
-- TOC entry 233 (class 1259 OID 25238)
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    invoice_id bigint NOT NULL,
    order_id bigint NOT NULL,
    user_id bigint NOT NULL,
    seller_id bigint,
    price double precision DEFAULT 0 NOT NULL,
    due_date timestamp without time zone NOT NULL,
    payment_date timestamp without time zone,
    status integer DEFAULT 1 NOT NULL,
    stripe_id character varying(120)
);


--ALTER TABLE public.invoices OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 25237)
-- Name: invoices_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_invoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.invoices_invoice_id_seq OWNER TO postgres;

--
-- TOC entry 3572 (class 0 OID 0)
-- Dependencies: 232
-- Name: invoices_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_invoice_id_seq OWNED BY public.invoices.invoice_id;


--
-- TOC entry 222 (class 1259 OID 25158)
-- Name: network_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.network_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.network_id_seq OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 25134)
-- Name: networks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.networks (
    network_id bigint DEFAULT nextval('public.network_id_seq'::regclass) NOT NULL,
    name character varying(80) NOT NULL,
    email character varying(180),
    commission double precision DEFAULT 0 NOT NULL,
    withdrawal_min double precision DEFAULT 0 NOT NULL,
    withdrawal_period integer DEFAULT 0 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    slug character varying(100) NOT NULL,
    plan integer DEFAULT 1 NOT NULL,
    image character varying(110)
);


--ALTER TABLE public.networks OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 25306)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    item_id bigint NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


--ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 25305)
-- Name: order_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.order_items_item_id_seq OWNER TO postgres;

--
-- TOC entry 3573 (class 0 OID 0)
-- Dependencies: 236
-- Name: order_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_item_id_seq OWNED BY public.order_items.item_id;


--
-- TOC entry 235 (class 1259 OID 25262)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id bigint NOT NULL,
    user_id bigint NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    stripe_id character varying(120),
    seller_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    network_id bigint NOT NULL
);


--ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 25261)
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- TOC entry 3574 (class 0 OID 0)
-- Dependencies: 234
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- TOC entry 231 (class 1259 OID 25222)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    product_id bigint NOT NULL,
    network_id bigint NOT NULL,
    name character varying(120) NOT NULL,
    price double precision DEFAULT 0 NOT NULL,
    frequency integer DEFAULT 0 NOT NULL,
    "limit" integer DEFAULT 0 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    slug character varying(140) NOT NULL,
    description text,
    stripe_product_id character varying(120),
    stripe_price_id character varying(120),
    image character varying(150)
);


--ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 25221)
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.products_product_id_seq OWNER TO postgres;

--
-- TOC entry 3575 (class 0 OID 0)
-- Dependencies: 230
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- TOC entry 223 (class 1259 OID 25160)
-- Name: profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.profile_id_seq OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 25402)
-- Name: template_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_pages (
    page_id bigint NOT NULL,
    template_id bigint NOT NULL,
    slug character varying(180) NOT NULL,
    title character varying(170) NOT NULL
);


--ALTER TABLE public.template_pages OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 25401)
-- Name: template_pages_page_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_pages_page_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.template_pages_page_id_seq OWNER TO postgres;

--
-- TOC entry 3576 (class 0 OID 0)
-- Dependencies: 246
-- Name: template_pages_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_pages_page_id_seq OWNED BY public.template_pages.page_id;


--
-- TOC entry 243 (class 1259 OID 25374)
-- Name: template_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_parts (
    part_id bigint NOT NULL,
    page_id bigint NOT NULL,
    part_key character varying(80) NOT NULL,
    "order" double precision DEFAULT 0 NOT NULL
);


--ALTER TABLE public.template_parts OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 25373)
-- Name: template_parts_part_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_parts_part_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.template_parts_part_id_seq OWNER TO postgres;

--
-- TOC entry 3577 (class 0 OID 0)
-- Dependencies: 242
-- Name: template_parts_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_parts_part_id_seq OWNED BY public.template_parts.part_id;


--
-- TOC entry 245 (class 1259 OID 25387)
-- Name: template_vars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_vars (
    var_id bigint NOT NULL,
    page_id bigint NOT NULL,
    language integer DEFAULT 1 NOT NULL,
    key character varying(80) NOT NULL,
    value text NOT NULL
);


--ALTER TABLE public.template_vars OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 25386)
-- Name: template_vars_var_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_vars_var_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.template_vars_var_id_seq OWNER TO postgres;

--
-- TOC entry 3578 (class 0 OID 0)
-- Dependencies: 244
-- Name: template_vars_var_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_vars_var_id_seq OWNED BY public.template_vars.var_id;


--
-- TOC entry 241 (class 1259 OID 25357)
-- Name: templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.templates (
    template_id bigint NOT NULL,
    network_id bigint,
    user_id bigint,
    title character varying(80),
    css character varying(80)
);


--ALTER TABLE public.templates OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 25356)
-- Name: templates_template_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.templates_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.templates_template_id_seq OWNER TO postgres;

--
-- TOC entry 3579 (class 0 OID 0)
-- Dependencies: 240
-- Name: templates_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.templates_template_id_seq OWNED BY public.templates.template_id;


--
-- TOC entry 225 (class 1259 OID 25178)
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_addresses (
    address_id bigint NOT NULL,
    user_id bigint NOT NULL,
    zip_code character varying(15),
    address character varying(150),
    complement character varying(150),
    neighborhood character varying(120),
    city character varying(120),
    state character varying(80)
);


--ALTER TABLE public.user_addresses OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 25177)
-- Name: user_addresses_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_addresses_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.user_addresses_address_id_seq OWNER TO postgres;

--
-- TOC entry 3580 (class 0 OID 0)
-- Dependencies: 224
-- Name: user_addresses_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_addresses_address_id_seq OWNED BY public.user_addresses.address_id;


--
-- TOC entry 229 (class 1259 OID 25202)
-- Name: user_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_documents (
    document_id bigint NOT NULL,
    user_id bigint,
    document_type integer DEFAULT 0 NOT NULL,
    base64 text
);


--ALTER TABLE public.user_documents OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 25201)
-- Name: user_documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_documents_document_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.user_documents_document_id_seq OWNER TO postgres;

--
-- TOC entry 3581 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_documents_document_id_seq OWNED BY public.user_documents.document_id;


--
-- TOC entry 221 (class 1259 OID 25156)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25151)
-- Name: user_networks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_networks (
    user_id bigint NOT NULL,
    network_id bigint NOT NULL,
    profile_id bigint,
    role integer DEFAULT 0 NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    referrer_id bigint
);


--ALTER TABLE public.user_networks OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25190)
-- Name: user_phones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_phones (
    phone_id bigint NOT NULL,
    user_id bigint NOT NULL,
    phone character varying(30) NOT NULL
);


--ALTER TABLE public.user_phones OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 25189)
-- Name: user_phones_phone_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_phones_phone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.user_phones_phone_id_seq OWNER TO postgres;

--
-- TOC entry 3582 (class 0 OID 0)
-- Dependencies: 226
-- Name: user_phones_phone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_phones_phone_id_seq OWNED BY public.user_phones.phone_id;


--
-- TOC entry 219 (class 1259 OID 25140)
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    profile_id bigint DEFAULT nextval('public.profile_id_seq'::regclass) NOT NULL,
    network_id bigint NOT NULL,
    name character varying(80) NOT NULL,
    commission double precision DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL
);


--ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 25126)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint DEFAULT nextval('public.user_id_seq'::regclass) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    hash character varying(128),
    email character varying(180) NOT NULL,
    name character varying(120) NOT NULL,
    password character varying(128),
    is_admin boolean DEFAULT false NOT NULL,
    token character varying(128),
    recovery_hash character varying(128),
    id_document character varying(30),
    birth_date timestamp without time zone,
    pix_key character varying(180),
    slug character varying(140) NOT NULL,
    stripe_id character varying(120),
    image character varying(150)
);


--ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 25438)
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdrawals (
    withdrawal_id bigint NOT NULL,
    network_id bigint NOT NULL,
    user_id bigint NOT NULL,
    duedate timestamp without time zone NOT NULL,
    status integer DEFAULT 1 NOT NULL
);


--ALTER TABLE public.withdrawals OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 25437)
-- Name: withdrawals_withdrawal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.withdrawals_withdrawal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--ALTER SEQUENCE public.withdrawals_withdrawal_id_seq OWNER TO postgres;

--
-- TOC entry 3583 (class 0 OID 0)
-- Dependencies: 248
-- Name: withdrawals_withdrawal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.withdrawals_withdrawal_id_seq OWNED BY public.withdrawals.withdrawal_id;


--
-- TOC entry 3318 (class 2604 OID 25328)
-- Name: invoice_fees fee_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees ALTER COLUMN fee_id SET DEFAULT nextval('public.invoice_commission_commission_id_seq'::regclass);


--
-- TOC entry 3311 (class 2604 OID 25241)
-- Name: invoices invoice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN invoice_id SET DEFAULT nextval('public.invoices_invoice_id_seq'::regclass);


--
-- TOC entry 3316 (class 2604 OID 25309)
-- Name: order_items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN item_id SET DEFAULT nextval('public.order_items_item_id_seq'::regclass);


--
-- TOC entry 3314 (class 2604 OID 25265)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- TOC entry 3306 (class 2604 OID 25225)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- TOC entry 3325 (class 2604 OID 25405)
-- Name: template_pages page_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_pages ALTER COLUMN page_id SET DEFAULT nextval('public.template_pages_page_id_seq'::regclass);


--
-- TOC entry 3321 (class 2604 OID 25377)
-- Name: template_parts part_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_parts ALTER COLUMN part_id SET DEFAULT nextval('public.template_parts_part_id_seq'::regclass);


--
-- TOC entry 3323 (class 2604 OID 25390)
-- Name: template_vars var_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_vars ALTER COLUMN var_id SET DEFAULT nextval('public.template_vars_var_id_seq'::regclass);


--
-- TOC entry 3320 (class 2604 OID 25360)
-- Name: templates template_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates ALTER COLUMN template_id SET DEFAULT nextval('public.templates_template_id_seq'::regclass);


--
-- TOC entry 3302 (class 2604 OID 25181)
-- Name: user_addresses address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses ALTER COLUMN address_id SET DEFAULT nextval('public.user_addresses_address_id_seq'::regclass);


--
-- TOC entry 3304 (class 2604 OID 25205)
-- Name: user_documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents ALTER COLUMN document_id SET DEFAULT nextval('public.user_documents_document_id_seq'::regclass);


--
-- TOC entry 3303 (class 2604 OID 25193)
-- Name: user_phones phone_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones ALTER COLUMN phone_id SET DEFAULT nextval('public.user_phones_phone_id_seq'::regclass);


--
-- TOC entry 3326 (class 2604 OID 25441)
-- Name: withdrawals withdrawal_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals ALTER COLUMN withdrawal_id SET DEFAULT nextval('public.withdrawals_withdrawal_id_seq'::regclass);


--
-- TOC entry 3554 (class 0 OID 25325)
-- Dependencies: 239
-- Data for Name: invoice_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.invoice_fees (fee_id, invoice_id, network_id, user_id, amount, paid_at) VALUES (2, 1, NULL, NULL, 4.4, NULL);
INSERT INTO public.invoice_fees (fee_id, invoice_id, network_id, user_id, amount, paid_at) VALUES (3, 1, 9, NULL, 26.4, NULL);
INSERT INTO public.invoice_fees (fee_id, invoice_id, network_id, user_id, amount, paid_at) VALUES (5, 3, NULL, NULL, 1, NULL);
INSERT INTO public.invoice_fees (fee_id, invoice_id, network_id, user_id, amount, paid_at) VALUES (6, 2, NULL, NULL, 1, NULL);


--
-- TOC entry 3548 (class 0 OID 25238)
-- Dependencies: 233
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.invoices (invoice_id, order_id, user_id, seller_id, price, due_date, payment_date, status, stripe_id) VALUES (1, 22, 16, NULL, 220, '-infinity', NULL, 3, 'in_1RLDEID37qwDaRRT6k6M4iLI');
INSERT INTO public.invoices (invoice_id, order_id, user_id, seller_id, price, due_date, payment_date, status, stripe_id) VALUES (3, 29, 18, NULL, 50, '-infinity', NULL, 3, 'in_1RQXa0D37qwDaRRTChrmnJvE');
INSERT INTO public.invoices (invoice_id, order_id, user_id, seller_id, price, due_date, payment_date, status, stripe_id) VALUES (2, 29, 18, NULL, 50, '-infinity', NULL, 3, 'in_1RQVLXD37qwDaRRTAXoMdmVq');


--
-- TOC entry 3533 (class 0 OID 25134)
-- Dependencies: 218
-- Data for Name: networks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan, image) VALUES (9, 'Rede do João', 'joao@gmail.com', 12, 400, 60, 1, 'rede-do-joao', 1, 'network-2goSLRoyEntGj9N2F3MqZP.jpg');
INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan, image) VALUES (10, 'Minha outra Rede', 'landim32@gmail.com', 10, 300, 30, 1, 'minha-outra-rede', 1, NULL);
INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan, image) VALUES (11, 'MonexUp', 'rodrigo@emagine.com.br', 0, 300, 60, 1, 'monexup', 1, 'https://emagine.nyc3.digitaloceanspaces.com/monexup/network-1cm1Y4FJg5cgieQhUQJ5Sn.jpg');
INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan, image) VALUES (12, 'Abrigo RK', 'rodrigo@abrigork.com.br', 0, 300, 30, 1, 'abrigo-rk', 1, 'network-2Gh7PQvPduX00Dp6uK0foz.jpg');


--
-- TOC entry 3552 (class 0 OID 25306)
-- Dependencies: 237
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (1, 21, 4, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (2, 22, 5, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (3, 23, 4, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (4, 24, 4, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (5, 25, 5, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (6, 26, 6, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (7, 27, 6, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (8, 28, 7, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (9, 29, 11, 1);


--
-- TOC entry 3550 (class 0 OID 25262)
-- Dependencies: 235
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (1, 14, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (2, 14, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (3, 14, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (4, 14, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (5, 14, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (6, 14, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (7, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (8, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (9, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (10, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (11, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (12, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (13, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (14, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (15, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (16, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (17, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (18, 16, 1, NULL, NULL, '2025-05-02 15:51:00.48203', '2025-05-02 15:51:00.48203', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (21, 14, 1, NULL, NULL, '2025-05-04 21:42:50.339182', '2025-05-04 21:42:50.339408', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (22, 16, 1, NULL, NULL, '2025-05-04 21:48:40.65389', '2025-05-04 21:48:40.653892', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (23, 16, 1, NULL, NULL, '2025-05-04 22:36:54.802677', '2025-05-04 22:36:54.802681', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (24, 16, 1, NULL, 16, '2025-05-05 10:09:43.190455', '2025-05-05 10:09:43.190714', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (25, 16, 1, NULL, 16, '2025-05-05 21:35:47.236426', '2025-05-05 21:35:47.23643', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (26, 16, 1, NULL, 16, '2025-05-09 17:40:17.367139', '2025-05-09 17:40:17.367512', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (27, 16, 1, NULL, 17, '2025-05-10 23:37:17.672885', '2025-05-10 23:37:17.672888', 9);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (28, 18, 1, NULL, NULL, '2025-05-16 17:54:25.611102', '2025-05-16 17:54:25.611106', 11);
INSERT INTO public.orders (order_id, user_id, status, stripe_id, seller_id, created_at, updated_at, network_id) VALUES (29, 18, 1, NULL, NULL, '2025-05-16 20:50:49.768916', '2025-05-16 20:50:49.768918', 12);


--
-- TOC entry 3546 (class 0 OID 25222)
-- Dependencies: 231
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (14, 12, 'Apadrinhe um Cão Grande', 185, 30, 0, 1, 'apadrinhe-um-cao-grande', '<p>Cães grandes têm grandes corações — e grandes estômagos.</p><p> Comem em média <strong>18kg/mês</strong>, o que representa <strong>R$ 180,00</strong>.</p><p><strong>Composição do custo:</strong></p><p><strong>- Ração premium para porte grande:</strong> R$ 180,00</p><p>	- Glucosamina e condroitina para articulações</p><p>	- Proteínas de alto valor biológico</p><p><strong>- Reserva emergencial:</strong> R$ 5,00</p><p>	- Itens de suporte ou pequenas despesas adicionais</p><p><br></p>', NULL, NULL, 'product-31Blt4S84yG0zYzwLYKU5Y.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (6, 9, 'Doação Única', 500, 0, 0, 1, 'doacao-unica', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun<strong>t ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Ex</strong>cepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>', 'prod_SEeIcpcqNTdE6I', 'price_1RKB0BD37qwDaRRTXFdVG151', 'product-3S8NU2OsI3qzEPCQsYQ7kL.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (5, 9, 'teste2', 220, 365, 0, 1, 'teste2', '<p>teste anual</p>', 'prod_SEeOzfZDHFKzHp', 'price_1RKB6LD37qwDaRRTeeAYkaka', NULL);
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (4, 9, 'teste', 20, 30, 0, 1, 'teste', '<p>teste</p><p>asdasdasd</p>', 'prod_SEwUrC5HL7FjNI', 'price_1RKSbuD37qwDaRRTW61gYgze', NULL);
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (8, 11, 'Entreprise', 299, 30, 0, 1, 'entreprise', '<h2>MonexUp Enterprise — Poder absoluto para grandes operações</h2><p>Para quem comanda grandes estruturas de vendas, o <strong>MonexUp Enterprise</strong> entrega <strong>capacidade máxima, flexibilidade total</strong> e performance sem limites.</p><p>Ideal para grandes marketplaces, redes de afiliados ou operações com múltiplos segmentos, este plano foi criado para <strong>atender os líderes de verdade</strong>:</p><p><strong>10 Redes independentes</strong> para estruturar diferentes marcas, times ou mercados.</p><p><strong>1.000 produtos por rede</strong>, oferecendo um catálogo completo e altamente segmentado.</p><p><strong>Sem taxas sobre transações</strong> — toda a receita é sua, sem comissões ou porcentagens.</p><p><strong>Vendedores ilimitados</strong>: monte uma força de vendas massiva sem limites operacionais.</p><h3>Por que escolher o Enterprise?</h3><p>O MonexUp Enterprise é a escolha definitiva para quem exige <strong>infraestrutura robusta</strong>, <strong>controle absoluto</strong> e <strong>crescimento sem barreiras</strong>. Ele não é apenas um plano: é a base para um império digital.</p><p>Pronto para dominar o mercado? Com o Enterprise, sua visão não tem teto.</p>', NULL, NULL, 'product-2ua5lyJ8rlf8Du8poTmfUT.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (10, 11, 'Enterprise (Annual)', 2870.4, 365, 0, 1, 'enterprise-annual', '<h2>MonexUp Enterprise — Poder absoluto para grandes operações</h2><p>Para quem comanda grandes estruturas de vendas, o <strong>MonexUp Enterprise</strong> entrega <strong>capacidade máxima, flexibilidade total</strong> e performance sem limites.</p><p>Ideal para grandes marketplaces, redes de afiliados ou operações com múltiplos segmentos, este plano foi criado para <strong>atender os líderes de verdade</strong>:</p><p><strong>10 Redes independentes</strong> para estruturar diferentes marcas, times ou mercados.</p><p><strong>1.000 produtos por rede</strong>, oferecendo um catálogo completo e altamente segmentado.</p><p><strong>Sem taxas sobre transações</strong> — toda a receita é sua, sem comissões ou porcentagens.</p><p><strong>Vendedores ilimitados</strong>: monte uma força de vendas massiva sem limites operacionais.</p><h3>Por que escolher o Enterprise?</h3><p>O MonexUp Enterprise é a escolha definitiva para quem exige <strong>infraestrutura robusta</strong>, <strong>controle absoluto</strong> e <strong>crescimento sem barreiras</strong>. Ele não é apenas um plano: é a base para um império digital.</p><p>Pronto para dominar o mercado? Com o Enterprise, sua visão não tem teto.</p>', NULL, NULL, 'product-2YB2SRKvJMe9WQY9ncyeS5.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (7, 11, 'Pro', 99, 30, 0, 1, 'pro', '<h2>MonexUp PRO — Liberdade total para expandir seu negócio</h2><p>Se você busca escala, controle e liberdade para crescer, o plano <strong>MonexUp PRO</strong> é para você.</p><p>Com ele, você não apenas vende mais — você <strong>constrói verdadeiras redes de vendas</strong>:</p><p><strong>3 Redes independentes</strong> para organizar suas estratégias de marketing e produtos.</p><p><strong>100 produtos por rede</strong>, permitindo uma vitrine robusta e completa.</p><p><strong>Zero taxa sobre transações</strong>: tudo o que você vender é 100% seu.</p><p><strong>Vendedores ilimitados</strong>: recrute quantos parceiros quiser, sem limites ou cobranças extras.</p><h3>Por que escolher o PRO?</h3><p>Com o MonexUp PRO, você ganha <strong>autonomia para crescer</strong> sem se preocupar com barreiras técnicas ou custos ocultos. Ele é ideal para quem deseja profissionalizar seu marketplace e <strong>maximizar lucros com escalabilidade real</strong>.</p><p>Comece hoje e transforme sua operação em um ecossistema de vendas completo.</p>', 'prod_SK9yniDV43Ajfa', 'price_1RPVe9D37qwDaRRTp6TVNWde', 'product-1pDHhLEg7Vqn87AmU8bKC9.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (9, 11, 'Pro (Annual)', 950.4, 365, 0, 1, 'pro-annual', '<h2>MonexUp PRO — Liberdade total para expandir seu negócio</h2><p>Se você busca escala, controle e liberdade para crescer, o plano <strong>MonexUp PRO</strong> é para você.</p><p>Com ele, você não apenas vende mais — você <strong>constrói verdadeiras redes de vendas</strong>:</p><p><strong>3 Redes independentes</strong> para organizar suas estratégias de marketing e produtos.</p><p><strong>100 produtos por rede</strong>, permitindo uma vitrine robusta e completa.</p><p><strong>Zero taxa sobre transações</strong>: tudo o que você vender é 100% seu.</p><p><strong>Vendedores ilimitados</strong>: recrute quantos parceiros quiser, sem limites ou cobranças extras.</p><h3>Por que escolher o PRO?</h3><p>Com o MonexUp PRO, você ganha <strong>autonomia para crescer</strong> sem se preocupar com barreiras técnicas ou custos ocultos. Ele é ideal para quem deseja profissionalizar seu marketplace e <strong>maximizar lucros com escalabilidade real</strong>.</p><p>Comece hoje e transforme sua operação em um ecossistema de vendas completo.</p>', NULL, NULL, 'product-1bhOhK0sPfnk2BEFVIpGF.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (12, 12, 'Apadrinhe um Cão Pequeno', 65, 30, 0, 1, 'apadrinhe-um-cao-pequeno', '<p>Cães de pequeno porte têm metabolismo rápido e precisam de uma alimentação específica.</p><p> Consumo médio: <strong>6kg de ração/mês</strong>, com custo base de <strong>R$ 60,00</strong>.</p><p><strong>Composição do custo:</strong></p><p><strong>- Ração seca premium:</strong> R$ 60,00</p><p>	- Grãos pequenos e de fácil digestão</p><p>	- Equilíbrio entre proteína e gordura</p><p><strong>- Reserva emergencial:</strong> R$ 5,00</p><p>	- Petiscos, vitaminas ou flutuação de preço</p><p><br></p>', NULL, NULL, 'product-dvCgGa3da0EkUWr0Mrw4a.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (13, 12, 'Apadrinhe um Cão Médio', 125, 30, 0, 1, 'apadrinhe-um-cao-medio', '<p>Esses cães são ativos e precisam de nutrição para manter energia e saúde articular.</p><p> Consumo mensal de <strong>12kg de ração</strong>, totalizando <strong>R$ 120,00</strong>.</p><p><strong>Composição do custo:</strong></p><p><strong>- Ração seca equilibrada:</strong> R$ 120,00</p><p>	- Proteínas de digestão lenta para saciedade</p><p>	- Condroitina para articulações</p><p><strong>- Reserva emergencial:</strong> R$ 5,00</p><p>	- Suplementos, vermífugos ou variações de preço</p><p><br></p>', NULL, NULL, 'product-1M1ytCY94E9hoGFadtdiSw.jpg');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id, image) VALUES (11, 12, 'Apadrinhe um Gatinho', 50, 30, 0, 1, 'apadrinhe-um-gatinho', '<p>Gatos são sensíveis e exigem uma nutrição rica em taurina, proteínas de qualidade e controle de bolas de pelo.</p><p>Um gato consome cerca de <strong>2,7kg de ração por mês</strong>, com custo estimado de <strong>R$ 48,60</strong>.</p><p><strong>Composição do custo:</strong></p><p><strong>- Ração seca premium:</strong> R$ 48,60</p><p>- Taurina para visão e coração</p><p>- Controle urinário</p><p>- Pelagem e imunidade fortalecidas</p><p><strong>- Reserva emergencial:</strong> R$ 1,40</p><p>- Reposição de potes ou reforço vitamínico leve</p>', 'prod_SLBi7jFyZuk5Ta', 'price_1RQVKfD37qwDaRRTs6UaUkq2', 'product-25lDFRYsKtXddZTJN0lOyg.jpg');


--
-- TOC entry 3562 (class 0 OID 25402)
-- Dependencies: 247
-- Data for Name: template_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (17, 12, 'network-home', 'Network Main Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (18, 12, 'network-seller', 'Network Seller Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (19, 12, 'network-product', 'Network Product Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (20, 13, 'network-home', 'Network Main Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (21, 13, 'network-seller', 'Network Seller Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (22, 13, 'network-product', 'Network Product Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (23, 14, 'network-home', 'Network Main Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (24, 14, 'network-seller', 'Network Seller Page');
INSERT INTO public.template_pages (page_id, template_id, slug, title) VALUES (25, 14, 'network-product', 'Network Product Page');


--
-- TOC entry 3558 (class 0 OID 25374)
-- Dependencies: 243
-- Data for Name: template_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (34, 17, 'TEAM_3_COLS', 2);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (35, 17, 'PLAN_3_COLS', 1);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (36, 17, 'HERO01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (37, 18, 'PLAN_3_COLS', 1);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (38, 18, 'PROFILE01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (39, 19, 'PRODUCT01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (40, 20, 'TEAM_3_COLS', 2);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (42, 20, 'HERO01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (43, 21, 'PLAN_3_COLS', 1);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (44, 21, 'PROFILE01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (45, 22, 'PRODUCT01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (41, 20, 'PLAN_4_COLS', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (46, 23, 'TEAM_3_COLS', 2);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (48, 23, 'HERO01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (49, 24, 'PLAN_3_COLS', 1);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (50, 24, 'PROFILE01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (51, 25, 'PRODUCT01', 0);
INSERT INTO public.template_parts (part_id, page_id, part_key, "order") VALUES (47, 23, 'PLAN_4_COLS', 0);


--
-- TOC entry 3560 (class 0 OID 25387)
-- Dependencies: 245
-- Data for Name: template_vars; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (345, 17, 1, 'HERO_TITLE', 'Welcome to My Network');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (346, 17, 2, 'HERO_TITLE', 'Bienvenido a mi red');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (347, 17, 3, 'HERO_TITLE', 'Bienvenue sur mon réseau');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (348, 17, 4, 'HERO_TITLE', 'Bem vindo a minha Rede');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (349, 17, 1, 'HERO_SLOGAN', 'Grow your income, build your future.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (350, 17, 2, 'HERO_SLOGAN', 'Haz crecer tus ingresos, construye tu futuro.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (351, 17, 3, 'HERO_SLOGAN', 'Augmentez vos revenus, construisez votre avenir.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (352, 17, 4, 'HERO_SLOGAN', 'Aumente sua renda, construa seu futuro.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (353, 17, 1, 'HERO_LINK_TO_PLANS', 'Explore our plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (354, 17, 2, 'HERO_LINK_TO_PLANS', 'Conoce nuestros planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (355, 17, 3, 'HERO_LINK_TO_PLANS', 'Découvrez nos plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (356, 17, 4, 'HERO_LINK_TO_PLANS', 'Conheça nossos planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (357, 17, 1, 'HERO_BECOME_A_SELLER', 'Become a representative');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (358, 17, 2, 'HERO_BECOME_A_SELLER', 'Conviértete en representante');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (359, 17, 3, 'HERO_BECOME_A_SELLER', 'Devenez représentant');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (360, 17, 4, 'HERO_BECOME_A_SELLER', 'Seja um representante');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (361, 17, 1, 'HERO_RESUME', 'Join a powerful network of entrepreneurs transforming lives through innovation, collaboration, and opportunity.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (362, 17, 2, 'HERO_RESUME', 'Únete a una red poderosa de emprendedores que transforman vidas mediante la innovación, la colaboración y la oportunidad.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (363, 17, 3, 'HERO_RESUME', 'Rejoignez un réseau puissant d''entrepreneurs qui transforment des vies grâce à l''innovation, la collaboration et les opportunités.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (364, 17, 4, 'HERO_RESUME', 'Junte-se a uma rede poderosa de empreendedores que transformam vidas com inovação, colaboração e oportunidade.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (365, 17, 1, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (366, 17, 2, 'PLAN_TITLE', 'Planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (367, 17, 3, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (368, 17, 4, 'PLAN_TITLE', 'Planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (369, 17, 1, 'PLAN_DESCRIPTION', 'Choose the plan that best fits your goals and start your journey to financial growth and personal success today.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (370, 17, 2, 'PLAN_DESCRIPTION', 'Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (371, 17, 3, 'PLAN_DESCRIPTION', 'Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd''hui votre parcours vers la croissance financière et le succès personnel.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (372, 17, 4, 'PLAN_DESCRIPTION', 'Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (373, 17, 1, 'TEAM_TITLE', 'Team');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (374, 17, 2, 'TEAM_TITLE', 'Equipo');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (375, 17, 3, 'TEAM_TITLE', 'Équipe');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (376, 17, 4, 'TEAM_TITLE', 'Equipe');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (377, 17, 1, 'TEAM_DESCRIPTION', 'Be part of a united team that shares knowledge, supports your growth, and celebrates every achievement with you. Together, we go further.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (378, 17, 2, 'TEAM_DESCRIPTION', 'Sé parte de un equipo unido que comparte conocimientos, apoya tu crecimiento y celebra contigo cada logro. Juntos llegamos más lejos.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (379, 17, 3, 'TEAM_DESCRIPTION', 'Faites partie d''une équipe unie qui partage ses connaissances, soutient votre développement et célèbre chaque réussite à vos côtés. Ensemble, nous allons plus loin.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (380, 17, 4, 'TEAM_DESCRIPTION', 'Faça parte de uma equipe unida que compartilha conhecimento, apoia seu crescimento e comemora cada conquista com você. Juntos, vamos mais longe.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (381, 18, 1, 'PROFILE_SLOGAN', 'Purpose-driven, results-focused.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (382, 18, 2, 'PROFILE_SLOGAN', 'Con propósito y enfocado en resultados.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (383, 18, 3, 'PROFILE_SLOGAN', 'Guidé par l’objectif, axé sur les résultats.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (384, 18, 4, 'PROFILE_SLOGAN', 'Com propósito e foco em resultados.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (385, 18, 1, 'PROFILE_DESCRIPTION', 'Work freely, earn by merit, and grow with a supportive community.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (386, 18, 2, 'PROFILE_DESCRIPTION', 'Trabaja con libertad, gana por mérito y crece con una comunidad que te apoya.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (387, 18, 3, 'PROFILE_DESCRIPTION', 'Travaillez librement, gagnez par mérite et évoluez avec une communauté solidaire.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (388, 18, 4, 'PROFILE_DESCRIPTION', 'Trabalhe com liberdade, ganhe por mérito e cresça com uma comunidade que apoia você.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (389, 18, 1, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (390, 18, 2, 'PLAN_TITLE', 'Planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (391, 18, 3, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (392, 18, 4, 'PLAN_TITLE', 'Planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (393, 18, 1, 'PLAN_DESCRIPTION', 'Choose the plan that best fits your goals and start your journey to financial growth and personal success today.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (394, 18, 2, 'PLAN_DESCRIPTION', 'Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (395, 18, 3, 'PLAN_DESCRIPTION', 'Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd''hui votre parcours vers la croissance financière et le succès personnel.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (396, 18, 4, 'PLAN_DESCRIPTION', 'Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (397, 20, 1, 'HERO_TITLE', 'Welcome to My Network');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (398, 20, 2, 'HERO_TITLE', 'Bienvenido a mi red');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (399, 20, 3, 'HERO_TITLE', 'Bienvenue sur mon réseau');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (400, 20, 4, 'HERO_TITLE', 'Bem vindo a minha Rede');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (401, 20, 1, 'HERO_SLOGAN', 'Grow your income, build your future.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (402, 20, 2, 'HERO_SLOGAN', 'Haz crecer tus ingresos, construye tu futuro.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (403, 20, 3, 'HERO_SLOGAN', 'Augmentez vos revenus, construisez votre avenir.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (404, 20, 4, 'HERO_SLOGAN', 'Aumente sua renda, construa seu futuro.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (409, 20, 1, 'HERO_BECOME_A_SELLER', 'Become a representative');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (414, 20, 2, 'HERO_RESUME', 'Únete a una red poderosa de emprendedores que transforman vidas mediante la innovación, la colaboración y la oportunidad.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (419, 20, 3, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (424, 20, 4, 'PLAN_DESCRIPTION', 'Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (429, 20, 1, 'TEAM_DESCRIPTION', 'Be part of a united team that shares knowledge, supports your growth, and celebrates every achievement with you. Together, we go further.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (433, 21, 1, 'PROFILE_SLOGAN', 'Purpose-driven, results-focused.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (438, 21, 2, 'PROFILE_DESCRIPTION', 'Trabaja con libertad, gana por mérito y crece con una comunidad que te apoya.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (442, 21, 2, 'PLAN_TITLE', 'Planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (446, 21, 2, 'PLAN_DESCRIPTION', 'Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (405, 20, 1, 'HERO_LINK_TO_PLANS', 'Explore our plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (410, 20, 2, 'HERO_BECOME_A_SELLER', 'Conviértete en representante');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (415, 20, 3, 'HERO_RESUME', 'Rejoignez un réseau puissant d''entrepreneurs qui transforment des vies grâce à l''innovation, la collaboration et les opportunités.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (420, 20, 4, 'PLAN_TITLE', 'Planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (425, 20, 1, 'TEAM_TITLE', 'Team');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (430, 20, 2, 'TEAM_DESCRIPTION', 'Sé parte de un equipo unido que comparte conocimientos, apoya tu crecimiento y celebra contigo cada logro. Juntos llegamos más lejos.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (434, 21, 2, 'PROFILE_SLOGAN', 'Con propósito y enfocado en resultados.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (439, 21, 3, 'PROFILE_DESCRIPTION', 'Travaillez librement, gagnez par mérite et évoluez avec une communauté solidaire.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (444, 21, 4, 'PLAN_TITLE', 'Planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (406, 20, 2, 'HERO_LINK_TO_PLANS', 'Conoce nuestros planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (411, 20, 3, 'HERO_BECOME_A_SELLER', 'Devenez représentant');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (416, 20, 4, 'HERO_RESUME', 'Junte-se a uma rede poderosa de empreendedores que transformam vidas com inovação, colaboração e oportunidade.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (421, 20, 1, 'PLAN_DESCRIPTION', 'Choose the plan that best fits your goals and start your journey to financial growth and personal success today.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (426, 20, 2, 'TEAM_TITLE', 'Equipo');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (431, 20, 3, 'TEAM_DESCRIPTION', 'Faites partie d''une équipe unie qui partage ses connaissances, soutient votre développement et célèbre chaque réussite à vos côtés. Ensemble, nous allons plus loin.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (435, 21, 3, 'PROFILE_SLOGAN', 'Guidé par l’objectif, axé sur les résultats.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (440, 21, 4, 'PROFILE_DESCRIPTION', 'Trabalhe com liberdade, ganhe por mérito e cresça com uma comunidade que apoia você.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (445, 21, 1, 'PLAN_DESCRIPTION', 'Choose the plan that best fits your goals and start your journey to financial growth and personal success today.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (407, 20, 3, 'HERO_LINK_TO_PLANS', 'Découvrez nos plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (412, 20, 4, 'HERO_BECOME_A_SELLER', 'Seja um representante');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (417, 20, 1, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (422, 20, 2, 'PLAN_DESCRIPTION', 'Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (427, 20, 3, 'TEAM_TITLE', 'Équipe');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (432, 20, 4, 'TEAM_DESCRIPTION', 'Faça parte de uma equipe unida que compartilha conhecimento, apoia seu crescimento e comemora cada conquista com você. Juntos, vamos mais longe.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (436, 21, 4, 'PROFILE_SLOGAN', 'Com propósito e foco em resultados.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (443, 21, 3, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (448, 21, 4, 'PLAN_DESCRIPTION', 'Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (408, 20, 4, 'HERO_LINK_TO_PLANS', 'Conheça nossos planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (413, 20, 1, 'HERO_RESUME', 'Join a powerful network of entrepreneurs transforming lives through innovation, collaboration, and opportunity.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (418, 20, 2, 'PLAN_TITLE', 'Planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (423, 20, 3, 'PLAN_DESCRIPTION', 'Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd''hui votre parcours vers la croissance financière et le succès personnel.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (428, 20, 4, 'TEAM_TITLE', 'Equipe');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (437, 21, 1, 'PROFILE_DESCRIPTION', 'Work freely, earn by merit, and grow with a supportive community.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (441, 21, 1, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (447, 21, 3, 'PLAN_DESCRIPTION', 'Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd''hui votre parcours vers la croissance financière et le succès personnel.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (449, 23, 1, 'HERO_TITLE', 'Welcome to My Network');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (450, 23, 2, 'HERO_TITLE', 'Bienvenido a mi red');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (451, 23, 3, 'HERO_TITLE', 'Bienvenue sur mon réseau');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (452, 23, 4, 'HERO_TITLE', 'Bem vindo a minha Rede');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (453, 23, 1, 'HERO_SLOGAN', 'Grow your income, build your future.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (454, 23, 2, 'HERO_SLOGAN', 'Haz crecer tus ingresos, construye tu futuro.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (455, 23, 3, 'HERO_SLOGAN', 'Augmentez vos revenus, construisez votre avenir.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (456, 23, 4, 'HERO_SLOGAN', 'Aumente sua renda, construa seu futuro.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (457, 23, 1, 'HERO_LINK_TO_PLANS', 'Explore our plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (458, 23, 2, 'HERO_LINK_TO_PLANS', 'Conoce nuestros planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (459, 23, 3, 'HERO_LINK_TO_PLANS', 'Découvrez nos plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (460, 23, 4, 'HERO_LINK_TO_PLANS', 'Conheça nossos planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (461, 23, 1, 'HERO_BECOME_A_SELLER', 'Become a representative');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (462, 23, 2, 'HERO_BECOME_A_SELLER', 'Conviértete en representante');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (463, 23, 3, 'HERO_BECOME_A_SELLER', 'Devenez représentant');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (464, 23, 4, 'HERO_BECOME_A_SELLER', 'Seja um representante');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (465, 23, 1, 'HERO_RESUME', 'Join a powerful network of entrepreneurs transforming lives through innovation, collaboration, and opportunity.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (466, 23, 2, 'HERO_RESUME', 'Únete a una red poderosa de emprendedores que transforman vidas mediante la innovación, la colaboración y la oportunidad.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (467, 23, 3, 'HERO_RESUME', 'Rejoignez un réseau puissant d''entrepreneurs qui transforment des vies grâce à l''innovation, la collaboration et les opportunités.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (468, 23, 4, 'HERO_RESUME', 'Junte-se a uma rede poderosa de empreendedores que transformam vidas com inovação, colaboração e oportunidade.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (469, 23, 1, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (470, 23, 2, 'PLAN_TITLE', 'Planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (471, 23, 3, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (472, 23, 4, 'PLAN_TITLE', 'Planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (473, 23, 1, 'PLAN_DESCRIPTION', 'Choose the plan that best fits your goals and start your journey to financial growth and personal success today.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (474, 23, 2, 'PLAN_DESCRIPTION', 'Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (475, 23, 3, 'PLAN_DESCRIPTION', 'Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd''hui votre parcours vers la croissance financière et le succès personnel.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (476, 23, 4, 'PLAN_DESCRIPTION', 'Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (477, 23, 1, 'TEAM_TITLE', 'Team');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (478, 23, 2, 'TEAM_TITLE', 'Equipo');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (479, 23, 3, 'TEAM_TITLE', 'Équipe');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (480, 23, 4, 'TEAM_TITLE', 'Equipe');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (481, 23, 1, 'TEAM_DESCRIPTION', 'Be part of a united team that shares knowledge, supports your growth, and celebrates every achievement with you. Together, we go further.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (482, 23, 2, 'TEAM_DESCRIPTION', 'Sé parte de un equipo unido que comparte conocimientos, apoya tu crecimiento y celebra contigo cada logro. Juntos llegamos más lejos.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (483, 23, 3, 'TEAM_DESCRIPTION', 'Faites partie d''une équipe unie qui partage ses connaissances, soutient votre développement et célèbre chaque réussite à vos côtés. Ensemble, nous allons plus loin.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (484, 23, 4, 'TEAM_DESCRIPTION', 'Faça parte de uma equipe unida que compartilha conhecimento, apoia seu crescimento e comemora cada conquista com você. Juntos, vamos mais longe.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (485, 24, 1, 'PROFILE_SLOGAN', 'Purpose-driven, results-focused.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (486, 24, 2, 'PROFILE_SLOGAN', 'Con propósito y enfocado en resultados.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (487, 24, 3, 'PROFILE_SLOGAN', 'Guidé par l’objectif, axé sur les résultats.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (488, 24, 4, 'PROFILE_SLOGAN', 'Com propósito e foco em resultados.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (489, 24, 1, 'PROFILE_DESCRIPTION', 'Work freely, earn by merit, and grow with a supportive community.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (490, 24, 2, 'PROFILE_DESCRIPTION', 'Trabaja con libertad, gana por mérito y crece con una comunidad que te apoya.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (491, 24, 3, 'PROFILE_DESCRIPTION', 'Travaillez librement, gagnez par mérite et évoluez avec une communauté solidaire.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (492, 24, 4, 'PROFILE_DESCRIPTION', 'Trabalhe com liberdade, ganhe por mérito e cresça com uma comunidade que apoia você.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (493, 24, 1, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (494, 24, 2, 'PLAN_TITLE', 'Planes');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (495, 24, 3, 'PLAN_TITLE', 'Plans');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (496, 24, 4, 'PLAN_TITLE', 'Planos');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (497, 24, 1, 'PLAN_DESCRIPTION', 'Choose the plan that best fits your goals and start your journey to financial growth and personal success today.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (498, 24, 2, 'PLAN_DESCRIPTION', 'Elige el plan que mejor se adapte a tus objetivos y comienza hoy tu camino hacia el crecimiento financiero y el éxito personal.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (499, 24, 3, 'PLAN_DESCRIPTION', 'Choisissez le plan qui correspond le mieux à vos objectifs et commencez dès aujourd''hui votre parcours vers la croissance financière et le succès personnel.');
INSERT INTO public.template_vars (var_id, page_id, language, key, value) VALUES (500, 24, 4, 'PLAN_DESCRIPTION', 'Escolha o plano que melhor se adapta aos seus objetivos e comece hoje mesmo sua jornada rumo ao crescimento financeiro e ao sucesso pessoal.');


--
-- TOC entry 3556 (class 0 OID 25357)
-- Dependencies: 241
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.templates (template_id, network_id, user_id, title, css) VALUES (12, 9, NULL, NULL, NULL);
INSERT INTO public.templates (template_id, network_id, user_id, title, css) VALUES (13, 11, NULL, NULL, NULL);
INSERT INTO public.templates (template_id, network_id, user_id, title, css) VALUES (14, 12, NULL, NULL, NULL);


--
-- TOC entry 3540 (class 0 OID 25178)
-- Dependencies: 225
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (14, 14, '73252900', 'Condomínio RK', 'Conj. Centauros Qd N Casa 42', 'Sobradinho', 'Brasília', 'DF');
INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (15, 16, '73252900', 'Condomínio RK', 'Conj Centauros Qd N Casa 42', 'Sobradinho', 'Brasília', 'DF');
INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (16, 17, '73252900', 'Condomínio RK', 'Qd N', 'Sobradinho', 'Brasília', 'DF');


--
-- TOC entry 3544 (class 0 OID 25202)
-- Dependencies: 229
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3535 (class 0 OID 25151)
-- Dependencies: 220
-- Data for Name: user_networks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (16, 9, NULL, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (16, 10, NULL, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (17, 9, 17, 2, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (18, 12, NULL, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (18, 11, 19, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (16, 11, 21, 2, 1, NULL);


--
-- TOC entry 3542 (class 0 OID 25190)
-- Dependencies: 227
-- Data for Name: user_phones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (16, 14, '61998752588');
INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (17, 16, '61998752588');
INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (18, 17, '61998752588');


--
-- TOC entry 3534 (class 0 OID 25140)
-- Dependencies: 219
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (13, 10, 'Gerente', 0, 1);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (14, 10, 'Vendedor', 0, 2);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (12, 9, 'Vendedor Supremo', 5, 2);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (11, 9, 'Gerente', 3, 1);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (16, 9, 'Teste', 2, 4);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (17, 9, 'Teste2', 4, 5);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (20, 11, 'Partner', 5, 2);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (19, 11, 'Master', 10, 1);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (21, 11, 'Aspirant', 2, 3);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (22, 12, 'Gerente', 0, 1);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (23, 12, 'Vendedor', 0, 2);


--
-- TOC entry 3532 (class 0 OID 25126)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id, image) VALUES (16, '2025-04-17 18:13:11.378002', '2025-05-13 10:14:14.159478', 'wEjf5xwT5EI8BpRSdkwc43ECjDcRBc9Z8f4qdgoUaRaD_IsuWxOhagS_c8emvxRfXO_s42rROt0PMeBgzHlL4XfEn9fwqbyUB1Se', 'joao@gmail.com', 'Joao Pedro', '4CE829DB2AE704F65058C58E242A527C', false, 'D60FDD4734C01E858BB7445C78AA6E17', NULL, NULL, NULL, NULL, 'joao-pedro', NULL, 'user-1Zf7hayOxMOUeXSluI8pI3.jpg');
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id, image) VALUES (15, '2025-04-17 16:47:36.312183', '2025-04-17 16:47:36.312185', 'GA6CiRWIJZbbThZDWbixb9maJeg70cRgBrF1k1l0_ZCQYeiZqH2gP5Sn4kHDcZo6XdeKfZDYKUW5IXz-fMv26Viw9Zkgo9S0RJqi', 'vivianemelo@gmail.com', 'Viviane Melo', NULL, false, NULL, NULL, NULL, NULL, NULL, 'viviane-melo', NULL, NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id, image) VALUES (18, '2025-05-16 19:29:13.049334', '2025-05-16 18:13:30.870622', 'r179_YN0ARX7Io9--SaKUop9SO8tYHdHjnUEPdk84-fdbSIFVewVUtur2mQiwdVYLMkq8tySHYynPav0b92_lVVwiZo0dQDIZVkY', 'rodrigo@emagine.com.br', 'Rodrigo Landim', '52A6BD009D45BCD900411191E42AA47C', false, 'DDEC8EFCBE63EEEF5915D3A95A07AE4F', NULL, NULL, NULL, NULL, 'rodrigo-landim1', NULL, 'user-3dYXlptxGppXLNiEMc2nQd.jpg');
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id, image) VALUES (17, '2025-04-29 15:39:11.426121', '2025-04-29 15:39:12.1544', '7K5kI2X-ogDYyLp-gidZYJJ7-FwginPLKB_VmgHc6yGa6w1xL6cj74p55JCnbu60YuWKfiwIHW0JJDmNPGXssCilJMi4_2dtDoHT', 'joao.paulo@gmail.com', 'Joao Paulo', 'BA4EF91DAE03BC74B88FCCFD2E4DC060', false, 'B42D7FB37CF78E3749EC4E2ECC8120CA', NULL, NULL, NULL, NULL, 'joao-paulo', NULL, NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id, image) VALUES (14, '2025-04-17 16:04:48.360057', '2025-04-17 16:17:40.292963', 'pU8MILkTP95axC7-02EyMt2cA6fTNsSv-IK5z6KrbG7iS6n76c8VDVsq39pRVy319DorstlJ5Gy06WByFpqRTSEfmMmSWylIWXV2', 'landim32@gmail.com', 'Rodrigo Landim', NULL, false, 'tokendoroot', NULL, NULL, NULL, NULL, 'rodrigo-landim', NULL, NULL);


--
-- TOC entry 3564 (class 0 OID 25438)
-- Dependencies: 249
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3584 (class 0 OID 0)
-- Dependencies: 238
-- Name: invoice_commission_commission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_commission_commission_id_seq', 6, true);


--
-- TOC entry 3585 (class 0 OID 0)
-- Dependencies: 232
-- Name: invoices_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_invoice_id_seq', 3, true);


--
-- TOC entry 3586 (class 0 OID 0)
-- Dependencies: 222
-- Name: network_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.network_id_seq', 12, true);


--
-- TOC entry 3587 (class 0 OID 0)
-- Dependencies: 236
-- Name: order_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_item_id_seq', 9, true);


--
-- TOC entry 3588 (class 0 OID 0)
-- Dependencies: 234
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 29, true);


--
-- TOC entry 3589 (class 0 OID 0)
-- Dependencies: 230
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 14, true);


--
-- TOC entry 3590 (class 0 OID 0)
-- Dependencies: 223
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_seq', 23, true);


--
-- TOC entry 3591 (class 0 OID 0)
-- Dependencies: 246
-- Name: template_pages_page_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_pages_page_id_seq', 25, true);


--
-- TOC entry 3592 (class 0 OID 0)
-- Dependencies: 242
-- Name: template_parts_part_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_parts_part_id_seq', 51, true);


--
-- TOC entry 3593 (class 0 OID 0)
-- Dependencies: 244
-- Name: template_vars_var_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_vars_var_id_seq', 500, true);


--
-- TOC entry 3594 (class 0 OID 0)
-- Dependencies: 240
-- Name: templates_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.templates_template_id_seq', 14, true);


--
-- TOC entry 3595 (class 0 OID 0)
-- Dependencies: 224
-- Name: user_addresses_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_addresses_address_id_seq', 16, true);


--
-- TOC entry 3596 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_documents_document_id_seq', 1, false);


--
-- TOC entry 3597 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 18, true);


--
-- TOC entry 3598 (class 0 OID 0)
-- Dependencies: 226
-- Name: user_phones_phone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_phones_phone_id_seq', 18, true);


--
-- TOC entry 3599 (class 0 OID 0)
-- Dependencies: 248
-- Name: withdrawals_withdrawal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.withdrawals_withdrawal_id_seq', 1, false);


--
-- TOC entry 3345 (class 2606 OID 25245)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 3331 (class 2606 OID 25139)
-- Name: networks networks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.networks
    ADD CONSTRAINT networks_pkey PRIMARY KEY (network_id);


--
-- TOC entry 3349 (class 2606 OID 25312)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (item_id);


--
-- TOC entry 3347 (class 2606 OID 25268)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 3351 (class 2606 OID 25331)
-- Name: invoice_fees pk_invoice_fee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT pk_invoice_fee PRIMARY KEY (fee_id);


--
-- TOC entry 3337 (class 2606 OID 25292)
-- Name: user_addresses pk_user_addresses; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT pk_user_addresses PRIMARY KEY (address_id);


--
-- TOC entry 3335 (class 2606 OID 25301)
-- Name: user_networks pk_user_network; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT pk_user_network PRIMARY KEY (user_id, network_id);


--
-- TOC entry 3343 (class 2606 OID 25231)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 3359 (class 2606 OID 25407)
-- Name: template_pages template_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_pages
    ADD CONSTRAINT template_pages_pkey PRIMARY KEY (page_id);


--
-- TOC entry 3355 (class 2606 OID 25380)
-- Name: template_parts template_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_parts
    ADD CONSTRAINT template_parts_pkey PRIMARY KEY (part_id);


--
-- TOC entry 3357 (class 2606 OID 25395)
-- Name: template_vars template_vars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_vars
    ADD CONSTRAINT template_vars_pkey PRIMARY KEY (var_id);


--
-- TOC entry 3353 (class 2606 OID 25362)
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (template_id);


--
-- TOC entry 3341 (class 2606 OID 25210)
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 3339 (class 2606 OID 25195)
-- Name: user_phones user_phones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones
    ADD CONSTRAINT user_phones_pkey PRIMARY KEY (phone_id);


--
-- TOC entry 3333 (class 2606 OID 25145)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 3329 (class 2606 OID 25133)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3361 (class 2606 OID 25444)
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (withdrawal_id);


--
-- TOC entry 3377 (class 2606 OID 25332)
-- Name: invoice_fees fk_fee_invoice; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT fk_fee_invoice FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id);


--
-- TOC entry 3378 (class 2606 OID 25337)
-- Name: invoice_fees fk_fee_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT fk_fee_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3379 (class 2606 OID 25342)
-- Name: invoice_fees fk_fee_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT fk_fee_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3371 (class 2606 OID 25279)
-- Name: invoices fk_invoice_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES public.orders(order_id) NOT VALID;


--
-- TOC entry 3372 (class 2606 OID 25256)
-- Name: invoices fk_invoice_seller; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_seller FOREIGN KEY (seller_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3373 (class 2606 OID 25251)
-- Name: invoices fk_invoice_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3370 (class 2606 OID 25232)
-- Name: products fk_network_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_network_product FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3376 (class 2606 OID 25313)
-- Name: order_items fk_order_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_item FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- TOC entry 3374 (class 2606 OID 25319)
-- Name: orders fk_order_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id) NOT VALID;


--
-- TOC entry 3375 (class 2606 OID 25274)
-- Name: orders fk_order_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3380 (class 2606 OID 25363)
-- Name: templates fk_template_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT fk_template_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3384 (class 2606 OID 25408)
-- Name: template_pages fk_template_page; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_pages
    ADD CONSTRAINT fk_template_page FOREIGN KEY (template_id) REFERENCES public.templates(template_id);


--
-- TOC entry 3382 (class 2606 OID 25413)
-- Name: template_parts fk_template_part_page; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_parts
    ADD CONSTRAINT fk_template_part_page FOREIGN KEY (page_id) REFERENCES public.template_pages(page_id) NOT VALID;


--
-- TOC entry 3381 (class 2606 OID 25368)
-- Name: templates fk_template_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT fk_template_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3383 (class 2606 OID 25418)
-- Name: template_vars fk_template_var_page; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_vars
    ADD CONSTRAINT fk_template_var_page FOREIGN KEY (page_id) REFERENCES public.template_pages(page_id) NOT VALID;


--
-- TOC entry 3367 (class 2606 OID 25184)
-- Name: user_addresses fk_user_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT fk_user_address FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3369 (class 2606 OID 25211)
-- Name: user_documents fk_user_document; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT fk_user_document FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3363 (class 2606 OID 25167)
-- Name: user_networks fk_user_network_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id) NOT VALID;


--
-- TOC entry 3364 (class 2606 OID 25172)
-- Name: user_networks fk_user_network_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_profile FOREIGN KEY (profile_id) REFERENCES public.user_profiles(profile_id) NOT VALID;


--
-- TOC entry 3365 (class 2606 OID 25216)
-- Name: user_networks fk_user_network_referrer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_referrer FOREIGN KEY (referrer_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3366 (class 2606 OID 25162)
-- Name: user_networks fk_user_network_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3368 (class 2606 OID 25196)
-- Name: user_phones fk_user_phone; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones
    ADD CONSTRAINT fk_user_phone FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3362 (class 2606 OID 25146)
-- Name: user_profiles fk_user_profile_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_user_profile_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3385 (class 2606 OID 25445)
-- Name: withdrawals fk_withdrawal_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawal_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3386 (class 2606 OID 25450)
-- Name: withdrawals fk_withdrawal_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawal_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2025-06-04 08:48:54

--
-- PostgreSQL database dump complete
--

