--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0 (Debian 17.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.1

-- Started on 2025-05-06 15:33:44

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

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3510 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

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


ALTER TABLE public.invoice_fees OWNER TO postgres;

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


ALTER SEQUENCE public.invoice_commission_commission_id_seq OWNER TO postgres;

--
-- TOC entry 3511 (class 0 OID 0)
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


ALTER TABLE public.invoices OWNER TO postgres;

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


ALTER SEQUENCE public.invoices_invoice_id_seq OWNER TO postgres;

--
-- TOC entry 3512 (class 0 OID 0)
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


ALTER SEQUENCE public.network_id_seq OWNER TO postgres;

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
    plan integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.networks OWNER TO postgres;

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


ALTER TABLE public.order_items OWNER TO postgres;

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


ALTER SEQUENCE public.order_items_item_id_seq OWNER TO postgres;

--
-- TOC entry 3513 (class 0 OID 0)
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


ALTER TABLE public.orders OWNER TO postgres;

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


ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- TOC entry 3514 (class 0 OID 0)
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
    stripe_price_id character varying(120)
);


ALTER TABLE public.products OWNER TO postgres;

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


ALTER SEQUENCE public.products_product_id_seq OWNER TO postgres;

--
-- TOC entry 3515 (class 0 OID 0)
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


ALTER SEQUENCE public.profile_id_seq OWNER TO postgres;

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


ALTER TABLE public.user_addresses OWNER TO postgres;

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


ALTER SEQUENCE public.user_addresses_address_id_seq OWNER TO postgres;

--
-- TOC entry 3516 (class 0 OID 0)
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


ALTER TABLE public.user_documents OWNER TO postgres;

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


ALTER SEQUENCE public.user_documents_document_id_seq OWNER TO postgres;

--
-- TOC entry 3517 (class 0 OID 0)
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


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

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


ALTER TABLE public.user_networks OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25190)
-- Name: user_phones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_phones (
    phone_id bigint NOT NULL,
    user_id bigint NOT NULL,
    phone character varying(30) NOT NULL
);


ALTER TABLE public.user_phones OWNER TO postgres;

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


ALTER SEQUENCE public.user_phones_phone_id_seq OWNER TO postgres;

--
-- TOC entry 3518 (class 0 OID 0)
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


ALTER TABLE public.user_profiles OWNER TO postgres;

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
    stripe_id character varying(120)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3293 (class 2604 OID 25328)
-- Name: invoice_fees fee_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees ALTER COLUMN fee_id SET DEFAULT nextval('public.invoice_commission_commission_id_seq'::regclass);


--
-- TOC entry 3286 (class 2604 OID 25241)
-- Name: invoices invoice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN invoice_id SET DEFAULT nextval('public.invoices_invoice_id_seq'::regclass);


--
-- TOC entry 3291 (class 2604 OID 25309)
-- Name: order_items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN item_id SET DEFAULT nextval('public.order_items_item_id_seq'::regclass);


--
-- TOC entry 3289 (class 2604 OID 25265)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- TOC entry 3281 (class 2604 OID 25225)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- TOC entry 3277 (class 2604 OID 25181)
-- Name: user_addresses address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses ALTER COLUMN address_id SET DEFAULT nextval('public.user_addresses_address_id_seq'::regclass);


--
-- TOC entry 3279 (class 2604 OID 25205)
-- Name: user_documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents ALTER COLUMN document_id SET DEFAULT nextval('public.user_documents_document_id_seq'::regclass);


--
-- TOC entry 3278 (class 2604 OID 25193)
-- Name: user_phones phone_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones ALTER COLUMN phone_id SET DEFAULT nextval('public.user_phones_phone_id_seq'::regclass);


--
-- TOC entry 3504 (class 0 OID 25325)
-- Dependencies: 239
-- Data for Name: invoice_fees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.invoice_fees (fee_id, invoice_id, network_id, user_id, amount, paid_at) VALUES (2, 1, NULL, NULL, 4.4, NULL);
INSERT INTO public.invoice_fees (fee_id, invoice_id, network_id, user_id, amount, paid_at) VALUES (3, 1, 9, NULL, 26.4, NULL);


--
-- TOC entry 3498 (class 0 OID 25238)
-- Dependencies: 233
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.invoices (invoice_id, order_id, user_id, seller_id, price, due_date, payment_date, status, stripe_id) VALUES (1, 22, 16, NULL, 220, '-infinity', NULL, 3, 'in_1RLDEID37qwDaRRT6k6M4iLI');


--
-- TOC entry 3483 (class 0 OID 25134)
-- Dependencies: 218
-- Data for Name: networks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan) VALUES (9, 'Rede do João', 'joao@gmail.com', 12, 400, 60, 1, 'rede-do-joao', 1);
INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan) VALUES (10, 'Minha outra Rede', 'rodrigo@emagine.com.br', 10, 300, 30, 1, 'minha-outra-rede', 1);


--
-- TOC entry 3502 (class 0 OID 25306)
-- Dependencies: 237
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (1, 21, 4, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (2, 22, 5, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (3, 23, 4, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (4, 24, 4, 1);
INSERT INTO public.order_items (item_id, order_id, product_id, quantity) VALUES (5, 25, 5, 1);


--
-- TOC entry 3500 (class 0 OID 25262)
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


--
-- TOC entry 3496 (class 0 OID 25222)
-- Dependencies: 231
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id) VALUES (6, 9, 'Doação Única', 500, 0, 0, 1, 'doacao-unica', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun<strong>t ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Ex</strong>cepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>', 'prod_SEeIcpcqNTdE6I', 'price_1RKB0BD37qwDaRRTXFdVG151');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id) VALUES (5, 9, 'teste2', 220, 365, 0, 1, 'teste2', '<p>teste anual</p>', 'prod_SEeOzfZDHFKzHp', 'price_1RKB6LD37qwDaRRTeeAYkaka');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id) VALUES (4, 9, 'teste', 20, 30, 0, 1, 'teste', '<p>teste</p><p>asdasdasd</p>', 'prod_SEwUrC5HL7FjNI', 'price_1RKSbuD37qwDaRRTW61gYgze');


--
-- TOC entry 3490 (class 0 OID 25178)
-- Dependencies: 225
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (14, 14, '73252900', 'Condomínio RK', 'Conj. Centauros Qd N Casa 42', 'Sobradinho', 'Brasília', 'DF');
INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (15, 16, '73252900', 'Condomínio RK', 'Conj Centauros Qd N Casa 42', 'Sobradinho', 'Brasília', 'DF');
INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (16, 17, '73252900', 'Condomínio RK', 'Qd N', 'Sobradinho', 'Brasília', 'DF');


--
-- TOC entry 3494 (class 0 OID 25202)
-- Dependencies: 229
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3485 (class 0 OID 25151)
-- Dependencies: 220
-- Data for Name: user_networks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (16, 9, NULL, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (16, 10, NULL, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (17, 9, 17, 2, 1, NULL);


--
-- TOC entry 3492 (class 0 OID 25190)
-- Dependencies: 227
-- Data for Name: user_phones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (16, 14, '61998752588');
INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (17, 16, '61998752588');
INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (18, 17, '61998752588');


--
-- TOC entry 3484 (class 0 OID 25140)
-- Dependencies: 219
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (13, 10, 'Gerente', 0, 1);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (14, 10, 'Vendedor', 0, 2);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (12, 9, 'Vendedor Supremo', 5, 2);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (11, 9, 'Gerente', 3, 1);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (16, 9, 'Teste', 2, 4);
INSERT INTO public.user_profiles (profile_id, network_id, name, commission, level) VALUES (17, 9, 'Teste2', 4, 5);


--
-- TOC entry 3482 (class 0 OID 25126)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (14, '2025-04-17 16:04:48.360057', '2025-04-17 16:17:40.292963', 'pU8MILkTP95axC7-02EyMt2cA6fTNsSv-IK5z6KrbG7iS6n76c8VDVsq39pRVy319DorstlJ5Gy06WByFpqRTSEfmMmSWylIWXV2', 'rodrigo@emagine.com.br', 'Rodrigo Landim', NULL, false, 'tokendoroot', NULL, NULL, NULL, NULL, 'rodrigo-landim', NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (15, '2025-04-17 16:47:36.312183', '2025-04-17 16:47:36.312185', 'GA6CiRWIJZbbThZDWbixb9maJeg70cRgBrF1k1l0_ZCQYeiZqH2gP5Sn4kHDcZo6XdeKfZDYKUW5IXz-fMv26Viw9Zkgo9S0RJqi', 'vivianemelo@gmail.com', 'Viviane Melo', NULL, false, NULL, NULL, NULL, NULL, NULL, 'viviane-melo', NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (17, '2025-04-29 15:39:11.426121', '2025-04-29 15:39:12.1544', '7K5kI2X-ogDYyLp-gidZYJJ7-FwginPLKB_VmgHc6yGa6w1xL6cj74p55JCnbu60YuWKfiwIHW0JJDmNPGXssCilJMi4_2dtDoHT', 'joao.paulo@gmail.com', 'Joao Paulo', 'BA4EF91DAE03BC74B88FCCFD2E4DC060', false, 'B42D7FB37CF78E3749EC4E2ECC8120CA', NULL, NULL, NULL, NULL, 'joao-paulo', NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (16, '2025-04-17 18:13:11.378002', '2025-04-27 18:42:21.877794', 'wEjf5xwT5EI8BpRSdkwc43ECjDcRBc9Z8f4qdgoUaRaD_IsuWxOhagS_c8emvxRfXO_s42rROt0PMeBgzHlL4XfEn9fwqbyUB1Se', 'joao@gmail.com', 'Joao Pedro', '4CE829DB2AE704F65058C58E242A527C', false, 'ECE742583DD68F2B178300E1958CE005', NULL, NULL, NULL, NULL, 'joao-pedro', NULL);


--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 238
-- Name: invoice_commission_commission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_commission_commission_id_seq', 3, true);


--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 232
-- Name: invoices_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_invoice_id_seq', 1, true);


--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 222
-- Name: network_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.network_id_seq', 10, true);


--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 236
-- Name: order_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_item_id_seq', 5, true);


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 234
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 25, true);


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 230
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 6, true);


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 223
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_seq', 18, true);


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 224
-- Name: user_addresses_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_addresses_address_id_seq', 16, true);


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_documents_document_id_seq', 1, false);


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 17, true);


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 226
-- Name: user_phones_phone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_phones_phone_id_seq', 18, true);


--
-- TOC entry 3312 (class 2606 OID 25245)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 3298 (class 2606 OID 25139)
-- Name: networks networks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.networks
    ADD CONSTRAINT networks_pkey PRIMARY KEY (network_id);


--
-- TOC entry 3316 (class 2606 OID 25312)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (item_id);


--
-- TOC entry 3314 (class 2606 OID 25268)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 3318 (class 2606 OID 25331)
-- Name: invoice_fees pk_invoice_fee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT pk_invoice_fee PRIMARY KEY (fee_id);


--
-- TOC entry 3304 (class 2606 OID 25292)
-- Name: user_addresses pk_user_addresses; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT pk_user_addresses PRIMARY KEY (address_id);


--
-- TOC entry 3302 (class 2606 OID 25301)
-- Name: user_networks pk_user_network; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT pk_user_network PRIMARY KEY (user_id, network_id);


--
-- TOC entry 3310 (class 2606 OID 25231)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 3308 (class 2606 OID 25210)
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 3306 (class 2606 OID 25195)
-- Name: user_phones user_phones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones
    ADD CONSTRAINT user_phones_pkey PRIMARY KEY (phone_id);


--
-- TOC entry 3300 (class 2606 OID 25145)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 3296 (class 2606 OID 25133)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3334 (class 2606 OID 25332)
-- Name: invoice_fees fk_fee_invoice; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT fk_fee_invoice FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id);


--
-- TOC entry 3335 (class 2606 OID 25337)
-- Name: invoice_fees fk_fee_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT fk_fee_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3336 (class 2606 OID 25342)
-- Name: invoice_fees fk_fee_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT fk_fee_user FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3328 (class 2606 OID 25279)
-- Name: invoices fk_invoice_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES public.orders(order_id) NOT VALID;


--
-- TOC entry 3329 (class 2606 OID 25256)
-- Name: invoices fk_invoice_seller; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_seller FOREIGN KEY (seller_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3330 (class 2606 OID 25251)
-- Name: invoices fk_invoice_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3327 (class 2606 OID 25232)
-- Name: products fk_network_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_network_product FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3333 (class 2606 OID 25313)
-- Name: order_items fk_order_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_item FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- TOC entry 3331 (class 2606 OID 25319)
-- Name: orders fk_order_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id) NOT VALID;


--
-- TOC entry 3332 (class 2606 OID 25274)
-- Name: orders fk_order_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3324 (class 2606 OID 25184)
-- Name: user_addresses fk_user_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT fk_user_address FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3326 (class 2606 OID 25211)
-- Name: user_documents fk_user_document; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT fk_user_document FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3320 (class 2606 OID 25167)
-- Name: user_networks fk_user_network_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id) NOT VALID;


--
-- TOC entry 3321 (class 2606 OID 25172)
-- Name: user_networks fk_user_network_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_profile FOREIGN KEY (profile_id) REFERENCES public.user_profiles(profile_id) NOT VALID;


--
-- TOC entry 3322 (class 2606 OID 25216)
-- Name: user_networks fk_user_network_referrer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_referrer FOREIGN KEY (referrer_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3323 (class 2606 OID 25162)
-- Name: user_networks fk_user_network_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3325 (class 2606 OID 25196)
-- Name: user_phones fk_user_phone; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones
    ADD CONSTRAINT fk_user_phone FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3319 (class 2606 OID 25146)
-- Name: user_profiles fk_user_profile_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_user_profile_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


-- Completed on 2025-05-06 15:34:07

--
-- PostgreSQL database dump complete
--

