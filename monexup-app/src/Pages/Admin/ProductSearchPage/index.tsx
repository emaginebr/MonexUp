import { useContext, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { useProduct, ProductStatusEnum } from "lofn-react";
import type { ProductInfo } from "lofn-react";
import {
  DonationModeEnum,
  ProductInfoExt,
  ProductTypeExtended,
} from "../../../DTO/Lofn/ProductExt";

import NetworkContext from "../../../Contexts/Network/NetworkContext";
import AuthContext from "../../../Contexts/Auth/AuthContext";
import UserContext from "../../../Contexts/User/UserContext";
import { UserRoleEnum } from "../../../DTO/Enum/UserRoleEnum";
import { MessageToastEnum } from "../../../DTO/Enum/MessageToastEnum";
import MessageToast from "../../../Components/MessageToast";
import { Skeleton } from "../../../Components/ui/skeleton";
import FormField from "../../NetworkEditPage/FormField";

import ProductSearchRow, {
  ProductSearchRowLabels,
} from "./ProductSearchRow";

/**
 * ProductSearchPage — redesigned `/admin/products` route.
 *
 * Visual contract: matches the editorial-brutalist light surface used by
 * `ProfileListPage` and `UserSearchPage` (compact page header band with the
 * 2px orange accent + breadcrumb, then a single `auth-card` body holding the
 * toolbar, the 12-col grid table on md+, and the in-document pagination).
 * Rendered inside `LayoutAdmin`, so this component does not render any
 * page chrome (sidebar/header come from the layout).
 *
 * Behavior preserved from the legacy `ProductManagePage`:
 *   - role gating: only Network Manager / Administrator can manage products
 *   - guards `product_manage_no_network` / `product_manage_no_session`
 *   - data flow uses `lofn-react`'s `useProduct().list(storeSlug, { skip,
 *     take })`, the same client `ProductManagePage`/`ProductFormPage` rely on
 *     (CLAUDE.md: products live in the external Lofn API, no MonexUp CRUD)
 *   - navigation targets unchanged — `/admin/products/new` and
 *     `/admin/products/:productId/edit`
 *   - errors surface through `MessageToast` (Error variant)
 */

const PAGE_SIZE = 20;

export default function ProductSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const networkContext = useContext(NetworkContext);
  const authContext = useContext(AuthContext);
  const userContext = useContext(UserContext);
  const productApi = useProduct();

  // Vendor product URL needs sellerSlug (the logged user's slug). AuthSession
  // only carries userId — fetch the full user once to resolve the slug and
  // enable the "Visualizar" affordance on each row.
  const [sellerSlug, setSellerSlug] = useState<string>("");
  useEffect(() => {
    if (!authContext?.sessionInfo?.userId || sellerSlug) return;
    let cancelled = false;
    (async () => {
      const ret = await userContext.getMe();
      if (cancelled) return;
      const slug = ret?.user?.slug || "";
      if (slug) setSellerSlug(slug);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext?.sessionInfo?.userId]);

  const network = networkContext?.network ?? networkContext?.userNetwork?.network ?? null;
  const session = authContext?.sessionInfo;
  const currentRole = networkContext?.currentRole;
  // Strict: only the actual Lofn store id is acceptable. If the network has
  // not been provisioned in Lofn yet, do NOT fall back to networkId — that
  // would show another store's products (or unfiltered global rows).
  const lofnStoreId = (network as any)?.lofnStoreId ?? null;
  const storeSlug = lofnStoreId ? String(lofnStoreId) : null;
  const isReady = Boolean(storeSlug);
  const needsProvisioning = Boolean(network) && !lofnStoreId;

  const [keyword, setKeyword] = useState<string>("");
  const [appliedKeyword, setAppliedKeyword] = useState<string>("");
  const [pageNum, setPageNum] = useState<number>(1);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [dialog, setDialog] = useState<MessageToastEnum>(MessageToastEnum.Error);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  const throwError = (message: string) => {
    setDialog(MessageToastEnum.Error);
    setMessageText(message);
    setShowMessage(true);
  };

  // Role gate: Network Manager / Seller / Administrator surface only.
  const isAuthorized =
    currentRole === UserRoleEnum.NetworkManager ||
    currentRole === UserRoleEnum.Administrator ||
    currentRole === UserRoleEnum.Seller;

  // -------------------------------------------------------------------
  // Data fetch — reuses the Lofn HTTP client via `lofn-react`. We keep
  // the page in lockstep with the search keyword on the client side
  // because Lofn's GraphQL `list` doesn't expose a keyword parameter
  // (see `ProductService.list` typings).
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthorized) return;
    const numericStoreId = lofnStoreId ? Number(lofnStoreId) : null;
    if (!numericStoreId) {
      // Network has no Lofn store yet — render empty list, never leak
      // products from any prior fetch.
      setProducts([]);
      setTotalCount(0);
      setHasNextPage(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const ret = await (productApi as any).search({
          storeId: numericStoreId,
          pageNum,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        const items: ProductInfo[] =
          (ret as any)?.products ??
          (ret as any)?.items ??
          [];
        const total: number =
          (ret as any)?.totalCount ??
          (ret as any)?.total ??
          items.length;
        setProducts(items);
        setTotalCount(total);
        setHasNextPage(items.length === PAGE_SIZE);
      } catch (err: any) {
        if (cancelled) return;
        throwError(
          err?.message ||
            t("admin_lofn_unavailable", "Lofn indisponível, tente novamente.")
        );
        setProducts([]);
        setTotalCount(0);
        setHasNextPage(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lofnStoreId, pageNum, isAuthorized]);

  // Client-side keyword filter against the current page (Lofn's list
  // endpoint doesn't take a keyword; the legacy ProductList behaved
  // the same way visually — search filters the visible result set).
  const filteredProducts = useMemo(() => {
    const term = appliedKeyword.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => {
      const haystack = `${p.name ?? ""} ${p.slug ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [products, appliedKeyword]);

  const onSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setAppliedKeyword(keyword);
  };

  const goToNew = () => navigate("/admin/products/new");

  // -------------------------------------------------------------------
  // Early guards (preserve legacy copy / behavior)
  // -------------------------------------------------------------------
  const networksLoading =
    Boolean(networkContext?.loading) ||
    ((networkContext?.userNetworks?.length ?? 0) === 0 && !networkContext?.userNetwork);

  if (!network) {
    return (
      <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
        <div className="max-w-container mx-auto px-shell pt-6 pb-12">
          {networksLoading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <p className="text-sm text-graphite-700">
              {t("product_manage_no_network", "Nenhuma rede selecionada.")}
            </p>
          )}
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
        <div className="max-w-container mx-auto px-shell pt-6 pb-12">
          <p className="text-sm text-graphite-700">
            {t("product_manage_no_session", "Sessão expirada.")}
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
        <div className="max-w-container mx-auto px-shell pt-6 pb-12">
          <p className="text-sm text-graphite-700">
            {t(
              "admin_product_not_authorized",
              "Você precisa ser gestor da rede para acessar esta área."
            )}
          </p>
        </div>
      </main>
    );
  }


  // -------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------
  const isLoading = loading;
  const isEmpty = !isLoading && filteredProducts.length === 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / PAGE_SIZE)) : 1;
  const currentPage = pageNum;
  const showPagination =
    !isLoading && !appliedKeyword && (totalPages > 1 || hasNextPage);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages || hasNextPage;

  // Status text helper (reuses existing translations).
  const showStatus = (status: ProductStatusEnum): string => {
    switch (status) {
      case ProductStatusEnum.Active:
        return t("product_status_active", "Ativo");
      case ProductStatusEnum.Inactive:
        return t("product_status_inactive", "Inativo");
      case ProductStatusEnum.Expired:
        return t("product_status_expired", "Expirado");
      default:
        return "";
    }
  };

  const baseRowLabels: Omit<ProductSearchRowLabels, "statusText" | "typeText" | "donationModeText" | "frequencyText"> = {
    edit: t("product_manage_updated", "Editar"),
    view: t("view", "Visualizar"),
    viewDisabledHint: t(
      "productSearchPage.viewDisabledHint",
      "Slug de rede ou vendedor indisponível",
    ),
    currency: t("productSearchPage.currency", "R$"),
    priceLabel: t("product_edit_price_label", "Preço"),
    typeLabel: t("admin_product_field_type", "Tipo"),
    frequencyLabel: t("admin_product_field_frequency", "Frequência"),
    statusLabel: t("product_edit_status_label", "Status"),
  };

  const networkSlug = (network as any)?.slug || "";

  // Translate ProductTypeExtended → label; Donation also surfaces the donation mode.
  const showProductType = (productType: number | undefined): string => {
    switch (productType) {
      case ProductTypeExtended.Physical:
        return t("admin_product_type_physical", "Físico");
      case ProductTypeExtended.InfoProduct:
        return t("admin_product_type_infoproduct", "Infoproduto");
      case ProductTypeExtended.Donation:
        return t("admin_product_type_donation", "Doação");
      default:
        return "—";
    }
  };
  const showDonationMode = (mode: number | undefined | null): string | undefined => {
    if (mode === DonationModeEnum.Fixed) return t("admin_product_donation_mode_fixed", "Fixo");
    if (mode === DonationModeEnum.Free) return t("admin_product_donation_mode_free", "Livre");
    return undefined;
  };

  // Frequência (dias) → label do combo. 0 (doações) → "—".
  const showFrequency = (frequency: number | undefined | null): string => {
    switch (frequency) {
      case 1:
        return t("admin_product_frequency_once", "Apenas uma vez");
      case 7:
        return t("admin_product_frequency_weekly", "Semanal");
      case 30:
        return t("admin_product_frequency_monthly", "Mensal");
      case 60:
        return t("admin_product_frequency_bimonthly", "Bimestral");
      case 90:
        return t("admin_product_frequency_quarterly", "Trimestral");
      case 150:
        return t("admin_product_frequency_biannual", "Semestral");
      case 365:
        return t("admin_product_frequency_annual", "Anual");
      default:
        return "—";
    }
  };

  return (
    <main className="mnx-surface-light bg-mnx-neutral-50 min-h-screen">
      <MessageToast
        dialog={dialog}
        showMessage={showMessage}
        messageText={messageText}
        onClose={() => setShowMessage(false)}
      />

      <div className="max-w-container mx-auto px-shell pt-6 pb-12">
        {/* 1. Page header band ------------------------------------------ */}
        <section
          className="flex flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 animate-fade-up"
          aria-labelledby="product-search-page-title"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block w-[2px] h-5 rounded-full bg-orange-500"
              />
              <h1
                id="product-search-page-title"
                className="display-headline text-graphite-900 text-2xl sm:text-3xl lg:text-[2rem] leading-tight"
              >
                {t("products")}
              </h1>
            </div>
            <nav aria-label="Breadcrumb" className="mt-2 ml-[14px] text-sm">
              <ol className="flex items-center gap-1 text-graphite-500">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-orange-600 transition-colors duration-fast"
                  >
                    {t("footer_dashboard")}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-graphite-300">
                  <ChevronRight size={14} />
                </li>
                <li
                  aria-current="page"
                  className="font-medium text-graphite-700 truncate max-w-[14rem]"
                >
                  {t("products")}
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={goToNew}
              className="cta-primary inline-flex h-9 items-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast"
            >
              <Plus size={16} aria-hidden="true" />
              {t("product_manage_new", "Novo produto")}
            </button>
          </div>
        </section>

        {/* 2. Search + table card --------------------------------------- */}
        <section
          aria-label={t("products")}
          className="auth-card relative p-4 sm:p-6 animate-fade-up"
        >
          {/* Toolbar ---------------------------------------------------- */}
          <form
            onSubmit={onSearchSubmit}
            className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
          >
            <div className="w-full sm:max-w-sm">
              <FormField
                id="product-search-keyword"
                label={t(
                  "productSearchPage.tableHeaders.product",
                  "Produto"
                )}
                icon={Search}
              >
                <input
                  id="product-search-keyword"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t(
                    "productSearchPage.searchPlaceholder",
                    "Buscar por nome ou slug"
                  )}
                  aria-label={t(
                    "productSearchPage.searchPlaceholder",
                    "Buscar por nome ou slug"
                  )}
                  className="flex-1 min-w-0 h-full bg-transparent text-sm text-graphite-900 placeholder:text-graphite-400 focus:outline-none pr-3"
                />
              </FormField>
            </div>
          </form>

          {/* Table ------------------------------------------------------ */}
          <div className="rounded-xl border border-mnx-neutral-200 overflow-hidden bg-white">
            {/* Desktop column header --------------------------------- */}
            {!isEmpty && (
              <div
                className="hidden md:!grid grid-cols-12 gap-4 px-4 h-11 items-center bg-mnx-neutral-50 border-b border-mnx-neutral-200"
                role="row"
              >
                <div
                  className="col-span-4 text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("productSearchPage.tableHeaders.product", "Produto")}
                </div>
                <div
                  className="col-span-2 text-left text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("admin_product_field_type", "Tipo")}
                </div>
                <div
                  className="col-span-2 text-left text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("admin_product_field_frequency", "Frequência")}
                </div>
                <div
                  className="col-span-2 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("productSearchPage.tableHeaders.price", "Preço")}
                </div>
                <div
                  className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  {t("productSearchPage.tableHeaders.status", "Status")}
                </div>
                <div
                  className="col-span-1 text-right text-[0.7rem] uppercase tracking-wider font-semibold text-graphite-500"
                  role="columnheader"
                >
                  <span className="sr-only">
                    {t(
                      "productSearchPage.tableHeaders.actions",
                      "Ações"
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Loading state ----------------------------------------- */}
            {isLoading && (
              <div className="divide-y divide-mnx-neutral-100" aria-busy="true">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="px-4 h-14 hidden md:!grid grid-cols-12 items-center gap-4"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-md" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="col-span-2 h-5 w-20 rounded-full" />
                    <Skeleton className="col-span-2 h-5 w-20 rounded-full" />
                    <Skeleton className="col-span-2 h-4 ml-auto w-20" />
                    <Skeleton className="col-span-1 h-5 ml-auto w-16 rounded-full" />
                    <Skeleton className="col-span-1 h-4 ml-auto w-9" />
                  </div>
                ))}
                {[0, 1, 2].map((idx) => (
                  <div
                    key={`m-${idx}`}
                    className="px-4 py-4 md:hidden space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-md" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4 ml-auto w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state ------------------------------------------- */}
            {isEmpty && (
              <div className="px-6 py-14 text-center">
                <span
                  className="mnx-stat-chip mnx-stat-chip--orange mx-auto"
                  aria-hidden="true"
                >
                  <Package size={22} />
                </span>
                <h3 className="mt-4 font-display font-bold text-graphite-900 text-lg sm:text-xl tracking-tight">
                  {t(
                    "productSearchPage.emptyTitle",
                    "Nenhum produto cadastrado"
                  )}
                </h3>
                <p className="mt-2 mx-auto max-w-md text-sm text-graphite-500 leading-relaxed">
                  {t(
                    "productSearchPage.emptyBody",
                    "Cadastre seu primeiro produto para que sua rede possa começar a vender."
                  )}
                </p>
                <button
                  type="button"
                  onClick={goToNew}
                  className="cta-primary inline-flex h-10 items-center gap-2 px-5 mt-6 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-glow-md transition-colors duration-fast"
                >
                  <Plus size={16} aria-hidden="true" />
                  {t("product_manage_new", "Novo produto")}
                </button>
              </div>
            )}

            {/* Rows -------------------------------------------------- */}
            {!isLoading && !isEmpty && (
              <div role="rowgroup">
                {filteredProducts.map((product) => {
                  const ext = product as ProductInfoExt;
                  const labels: ProductSearchRowLabels = {
                    ...baseRowLabels,
                    statusText: showStatus(product.status),
                    typeText: showProductType(ext.productType as number | undefined),
                    frequencyText: showFrequency(ext.frequency as number | null | undefined),
                    donationModeText:
                      ext.productType === ProductTypeExtended.Donation
                        ? showDonationMode(ext.donationMode as number | null | undefined)
                        : undefined,
                  };
                  return (
                    <ProductSearchRow
                      key={product.productId}
                      product={ext}
                      labels={labels}
                      networkSlug={networkSlug}
                      sellerSlug={sellerSlug}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination footer ----------------------------------------- */}
          {showPagination && (
            <nav
              aria-label="Pagination"
              className="mt-4 flex items-center justify-between gap-3"
            >
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className="inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span>{t("userSearchPage.actions.previous")}</span>
              </button>

              <span className="text-xs text-graphite-500 mnx-num tabular-nums">
                {t("userSearchPage.pageOf", {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>

              <button
                type="button"
                onClick={() => setPageNum((p) => p + 1)}
                disabled={!canNext}
                className="inline-flex h-9 items-center gap-1 px-3 rounded-md text-sm font-medium text-graphite-700 hover:bg-mnx-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span>{t("userSearchPage.actions.next")}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
