--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0 (Debian 17.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.1

-- Started on 2025-05-02 12:23:46

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
-- TOC entry 3485 (class 1262 OID 25125)
-- Name: exsales; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE exsales WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE exsales OWNER TO postgres;

\connect exsales

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
-- TOC entry 3486 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- TOC entry 3487 (class 0 OID 0)
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
-- TOC entry 235 (class 1259 OID 25262)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    user_id bigint NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    stripe_id character varying(120),
    seller_id bigint,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
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
-- TOC entry 3488 (class 0 OID 0)
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
-- TOC entry 3489 (class 0 OID 0)
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
-- TOC entry 3490 (class 0 OID 0)
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
-- TOC entry 3491 (class 0 OID 0)
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
-- TOC entry 3492 (class 0 OID 0)
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
-- TOC entry 3276 (class 2604 OID 25241)
-- Name: invoices invoice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN invoice_id SET DEFAULT nextval('public.invoices_invoice_id_seq'::regclass);


--
-- TOC entry 3279 (class 2604 OID 25265)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- TOC entry 3271 (class 2604 OID 25225)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- TOC entry 3267 (class 2604 OID 25181)
-- Name: user_addresses address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses ALTER COLUMN address_id SET DEFAULT nextval('public.user_addresses_address_id_seq'::regclass);


--
-- TOC entry 3269 (class 2604 OID 25205)
-- Name: user_documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents ALTER COLUMN document_id SET DEFAULT nextval('public.user_documents_document_id_seq'::regclass);


--
-- TOC entry 3268 (class 2604 OID 25193)
-- Name: user_phones phone_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones ALTER COLUMN phone_id SET DEFAULT nextval('public.user_phones_phone_id_seq'::regclass);


--
-- TOC entry 3477 (class 0 OID 25238)
-- Dependencies: 233
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3462 (class 0 OID 25134)
-- Dependencies: 218
-- Data for Name: networks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan) VALUES (9, 'Rede do João', 'joao@gmail.com', 12, 400, 60, 1, 'rede-do-joao', 1);
INSERT INTO public.networks (network_id, name, email, commission, withdrawal_min, withdrawal_period, status, slug, plan) VALUES (10, 'Minha outra Rede', 'rodrigo@emagine.com.br', 10, 300, 30, 1, 'minha-outra-rede', 1);


--
-- TOC entry 3479 (class 0 OID 25262)
-- Dependencies: 235
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (1, 4, 14, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (2, 4, 14, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (3, 4, 14, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (4, 4, 14, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (5, 4, 14, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (6, 4, 14, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (7, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (8, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (9, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (10, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (11, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (12, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (13, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (14, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (15, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (16, 4, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (17, 5, 16, 1, NULL, NULL, 1, NULL, NULL);
INSERT INTO public.orders (order_id, product_id, user_id, status, stripe_id, seller_id, quantity, created_at, updated_at) VALUES (18, 6, 16, 1, NULL, NULL, 1, NULL, NULL);


--
-- TOC entry 3475 (class 0 OID 25222)
-- Dependencies: 231
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id) VALUES (4, 9, 'teste', 20, 30, 0, 1, 'teste', '<p>teste</p><p>asdasdasd</p>', NULL, NULL);
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id) VALUES (6, 9, 'Doação Única', 500, 0, 0, 1, 'doacao-unica', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun<strong>t ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Ex</strong>cepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>', 'prod_SEeIcpcqNTdE6I', 'price_1RKB0BD37qwDaRRTXFdVG151');
INSERT INTO public.products (product_id, network_id, name, price, frequency, "limit", status, slug, description, stripe_product_id, stripe_price_id) VALUES (5, 9, 'teste2', 220, 365, 0, 1, 'teste2', '<p>teste anual</p>', 'prod_SEeOzfZDHFKzHp', 'price_1RKB6LD37qwDaRRTeeAYkaka');


--
-- TOC entry 3469 (class 0 OID 25178)
-- Dependencies: 225
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (14, 14, '73252900', 'Condomínio RK', 'Conj. Centauros Qd N Casa 42', 'Sobradinho', 'Brasília', 'DF');
INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (15, 16, '73252900', 'Condomínio RK', 'Conj Centauros Qd N Casa 42', 'Sobradinho', 'Brasília', 'DF');
INSERT INTO public.user_addresses (address_id, user_id, zip_code, address, complement, neighborhood, city, state) VALUES (16, 17, '73252900', 'Condomínio RK', 'Qd N', 'Sobradinho', 'Brasília', 'DF');


--
-- TOC entry 3473 (class 0 OID 25202)
-- Dependencies: 229
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3464 (class 0 OID 25151)
-- Dependencies: 220
-- Data for Name: user_networks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (16, 9, NULL, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (16, 10, NULL, 3, 1, NULL);
INSERT INTO public.user_networks (user_id, network_id, profile_id, role, status, referrer_id) VALUES (17, 9, 17, 2, 1, NULL);


--
-- TOC entry 3471 (class 0 OID 25190)
-- Dependencies: 227
-- Data for Name: user_phones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (16, 14, '61998752588');
INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (17, 16, '61998752588');
INSERT INTO public.user_phones (phone_id, user_id, phone) VALUES (18, 17, '61998752588');


--
-- TOC entry 3463 (class 0 OID 25140)
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
-- TOC entry 3461 (class 0 OID 25126)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (14, '2025-04-17 16:04:48.360057', '2025-04-17 16:17:40.292963', 'pU8MILkTP95axC7-02EyMt2cA6fTNsSv-IK5z6KrbG7iS6n76c8VDVsq39pRVy319DorstlJ5Gy06WByFpqRTSEfmMmSWylIWXV2', 'rodrigo@emagine.com.br', 'Rodrigo Landim', NULL, false, 'tokendoroot', NULL, NULL, NULL, NULL, 'rodrigo-landim', NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (15, '2025-04-17 16:47:36.312183', '2025-04-17 16:47:36.312185', 'GA6CiRWIJZbbThZDWbixb9maJeg70cRgBrF1k1l0_ZCQYeiZqH2gP5Sn4kHDcZo6XdeKfZDYKUW5IXz-fMv26Viw9Zkgo9S0RJqi', 'vivianemelo@gmail.com', 'Viviane Melo', NULL, false, NULL, NULL, NULL, NULL, NULL, 'viviane-melo', NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (17, '2025-04-29 15:39:11.426121', '2025-04-29 15:39:12.1544', '7K5kI2X-ogDYyLp-gidZYJJ7-FwginPLKB_VmgHc6yGa6w1xL6cj74p55JCnbu60YuWKfiwIHW0JJDmNPGXssCilJMi4_2dtDoHT', 'joao.paulo@gmail.com', 'Joao Paulo', 'BA4EF91DAE03BC74B88FCCFD2E4DC060', false, 'B42D7FB37CF78E3749EC4E2ECC8120CA', NULL, NULL, NULL, NULL, 'joao-paulo', NULL);
INSERT INTO public.users (user_id, created_at, updated_at, hash, email, name, password, is_admin, token, recovery_hash, id_document, birth_date, pix_key, slug, stripe_id) VALUES (16, '2025-04-17 18:13:11.378002', '2025-04-27 18:42:21.877794', 'wEjf5xwT5EI8BpRSdkwc43ECjDcRBc9Z8f4qdgoUaRaD_IsuWxOhagS_c8emvxRfXO_s42rROt0PMeBgzHlL4XfEn9fwqbyUB1Se', 'joao@gmail.com', 'Joao Pedro', '4CE829DB2AE704F65058C58E242A527C', false, '3F897F1371220EBCB39B3B66C8703F9B', NULL, NULL, NULL, NULL, 'joao-pedro', NULL);


--
-- TOC entry 3493 (class 0 OID 0)
-- Dependencies: 232
-- Name: invoices_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_invoice_id_seq', 1, false);


--
-- TOC entry 3494 (class 0 OID 0)
-- Dependencies: 222
-- Name: network_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.network_id_seq', 10, true);


--
-- TOC entry 3495 (class 0 OID 0)
-- Dependencies: 234
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 18, true);


--
-- TOC entry 3496 (class 0 OID 0)
-- Dependencies: 230
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 6, true);


--
-- TOC entry 3497 (class 0 OID 0)
-- Dependencies: 223
-- Name: profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_id_seq', 18, true);


--
-- TOC entry 3498 (class 0 OID 0)
-- Dependencies: 224
-- Name: user_addresses_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_addresses_address_id_seq', 16, true);


--
-- TOC entry 3499 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_documents_document_id_seq', 1, false);


--
-- TOC entry 3500 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 17, true);


--
-- TOC entry 3501 (class 0 OID 0)
-- Dependencies: 226
-- Name: user_phones_phone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_phones_phone_id_seq', 18, true);


--
-- TOC entry 3299 (class 2606 OID 25245)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 3285 (class 2606 OID 25139)
-- Name: networks networks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.networks
    ADD CONSTRAINT networks_pkey PRIMARY KEY (network_id);


--
-- TOC entry 3301 (class 2606 OID 25268)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 3291 (class 2606 OID 25292)
-- Name: user_addresses pk_user_addresses; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT pk_user_addresses PRIMARY KEY (address_id);


--
-- TOC entry 3289 (class 2606 OID 25301)
-- Name: user_networks pk_user_network; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT pk_user_network PRIMARY KEY (user_id, network_id);


--
-- TOC entry 3297 (class 2606 OID 25231)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 3295 (class 2606 OID 25210)
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 3293 (class 2606 OID 25195)
-- Name: user_phones user_phones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones
    ADD CONSTRAINT user_phones_pkey PRIMARY KEY (phone_id);


--
-- TOC entry 3287 (class 2606 OID 25145)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 3283 (class 2606 OID 25133)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3311 (class 2606 OID 25279)
-- Name: invoices fk_invoice_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES public.orders(order_id) NOT VALID;


--
-- TOC entry 3312 (class 2606 OID 25256)
-- Name: invoices fk_invoice_seller; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_seller FOREIGN KEY (seller_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3313 (class 2606 OID 25251)
-- Name: invoices fk_invoice_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3310 (class 2606 OID 25232)
-- Name: products fk_network_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_network_product FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


--
-- TOC entry 3314 (class 2606 OID 25269)
-- Name: orders fk_oder_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_oder_product FOREIGN KEY (product_id) REFERENCES public.products(product_id) NOT VALID;


--
-- TOC entry 3315 (class 2606 OID 25274)
-- Name: orders fk_order_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3307 (class 2606 OID 25184)
-- Name: user_addresses fk_user_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT fk_user_address FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3309 (class 2606 OID 25211)
-- Name: user_documents fk_user_document; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT fk_user_document FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3303 (class 2606 OID 25167)
-- Name: user_networks fk_user_network_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id) NOT VALID;


--
-- TOC entry 3304 (class 2606 OID 25172)
-- Name: user_networks fk_user_network_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_profile FOREIGN KEY (profile_id) REFERENCES public.user_profiles(profile_id) NOT VALID;


--
-- TOC entry 3305 (class 2606 OID 25216)
-- Name: user_networks fk_user_network_referrer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_referrer FOREIGN KEY (referrer_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3306 (class 2606 OID 25162)
-- Name: user_networks fk_user_network_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_networks
    ADD CONSTRAINT fk_user_network_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;


--
-- TOC entry 3308 (class 2606 OID 25196)
-- Name: user_phones fk_user_phone; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_phones
    ADD CONSTRAINT fk_user_phone FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3302 (class 2606 OID 25146)
-- Name: user_profiles fk_user_profile_network; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_user_profile_network FOREIGN KEY (network_id) REFERENCES public.networks(network_id);


-- Completed on 2025-05-02 12:24:06

--
-- PostgreSQL database dump complete
--

