/**
 * VendorProductSkeleton — shimmering placeholder shown while the vendor
 * product page bootstraps (network + seller + product fetches).
 *
 * Mirrors the Vibrant/Editorial template skeleton: store-header strip
 * (logo + title + back affordance) → wide hero (16/10) + 4 thumbs →
 * info card with title, description, price, payment options and the
 * inline buyer form. Neutral palette (cream + soft graphite blocks) so
 * it harmonizes with whichever template ends up rendering.
 *
 * Self-contained CSS via inline <style> + scoped under `.v-skel` so it
 * never leaks into the live template styles.
 */
export default function VendorProductSkeleton() {
    return (
        <div className="v-skel">
            <style dangerouslySetInnerHTML={{ __html: skelCss }} />

            {/* STORE HEADER STRIP */}
            <header className="vs-header">
                <div className="vs-logo shimmer" />
                <div className="vs-meta">
                    <div className="vs-line vs-line--title shimmer" />
                    <div className="vs-line vs-line--sub shimmer" />
                </div>
                <div className="vs-chip shimmer" />
                <div className="vs-back shimmer" />
            </header>

            <article className="vs-product">
                {/* GALLERY */}
                <div className="vs-gallery">
                    <div className="vs-hero shimmer" />
                    <div className="vs-thumbs">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="vs-thumb shimmer" />
                        ))}
                    </div>
                </div>

                {/* INFO CARD */}
                <div className="vs-info">
                    <div className="vs-line vs-line--eyebrow shimmer" />
                    <div className="vs-line vs-line--h1 shimmer" />
                    <div className="vs-line vs-line--h1 vs-line--h1-2 shimmer" />

                    <div className="vs-desc">
                        <div className="vs-line vs-line--p shimmer" />
                        <div className="vs-line vs-line--p shimmer" />
                        <div className="vs-line vs-line--p vs-line--p-short shimmer" />
                    </div>

                    {/* PRICE BLOCK */}
                    <div className="vs-price-block">
                        <div className="vs-line vs-line--price shimmer" />
                        <div className="vs-pill shimmer" />
                    </div>

                    {/* PAYMENT */}
                    <div className="vs-payment">
                        <div className="vs-line vs-line--label shimmer" />
                        <div className="vs-pay-row">
                            <div className="vs-pay shimmer" />
                            <div className="vs-pay shimmer" />
                            <div className="vs-pay shimmer" />
                        </div>
                    </div>

                    {/* BUYER FORM */}
                    <div className="vs-form">
                        <div className="vs-line vs-line--label shimmer" />
                        <div className="vs-form-grid">
                            <div className="vs-field shimmer" />
                            <div className="vs-field shimmer" />
                            <div className="vs-field shimmer" />
                            <div className="vs-field shimmer" />
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="vs-cta shimmer" />
                </div>
            </article>
        </div>
    );
}

const skelCss = `
.v-skel {
  --skel-surface: #FFF8F2;
  --skel-card:    #FFFFFF;
  --skel-line:    rgba(0, 0, 0, 0.06);
  --skel-base:    rgba(26, 24, 18, 0.08);
  --skel-hi:      rgba(26, 24, 18, 0.14);

  min-height: 100vh;
  background: var(--skel-surface);
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  padding: 0 0 56px;
}

@keyframes vsShimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.v-skel .shimmer {
  background-color: var(--skel-base);
  background-image: linear-gradient(
    90deg,
    var(--skel-base) 0%,
    var(--skel-hi) 50%,
    var(--skel-base) 100%
  );
  background-size: 800px 100%;
  background-repeat: no-repeat;
  animation: vsShimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}

/* HEADER */
.v-skel .vs-header {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 18px clamp(20px, 5vw, 56px);
  border-bottom: 1px solid var(--skel-line);
  background: var(--skel-card);
}
.v-skel .vs-logo { width: 44px; height: 44px; border-radius: 12px; }
.v-skel .vs-meta { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.v-skel .vs-line { display: block; height: 14px; border-radius: 6px; }
.v-skel .vs-line--title { height: 18px; width: 220px; max-width: 60vw; }
.v-skel .vs-line--sub   { height: 12px; width: 140px; max-width: 40vw; }
.v-skel .vs-chip { width: 180px; height: 28px; border-radius: 999px; }
.v-skel .vs-back { width: 92px; height: 36px; border-radius: 999px; }

@media (max-width: 760px) {
  .v-skel .vs-header { grid-template-columns: auto 1fr auto; }
  .v-skel .vs-chip { display: none; }
}

/* PRODUCT GRID */
.v-skel .vs-product {
  padding: clamp(20px, 4vw, 40px) clamp(20px, 5vw, 56px) 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(24px, 4vw, 40px);
}
@media (min-width: 980px) {
  .v-skel .vs-product { grid-template-columns: 1.5fr 1fr; align-items: start; }
}

/* GALLERY */
.v-skel .vs-gallery { display: flex; flex-direction: column; gap: 12px; }
.v-skel .vs-hero {
  aspect-ratio: 16 / 10;
  border-radius: 28px;
}
.v-skel .vs-thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.v-skel .vs-thumb {
  aspect-ratio: 1 / 1;
  border-radius: 14px;
}

/* INFO CARD */
.v-skel .vs-info {
  background: var(--skel-card);
  border: 1px solid var(--skel-line);
  border-radius: 22px;
  padding: clamp(20px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 10px 30px -16px rgba(26, 24, 18, 0.15);
}
.v-skel .vs-line--eyebrow { height: 12px; width: 120px; }
.v-skel .vs-line--h1      { height: 28px; width: 80%; }
.v-skel .vs-line--h1-2    { width: 55%; }
.v-skel .vs-desc { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.v-skel .vs-line--p       { height: 12px; width: 100%; }
.v-skel .vs-line--p-short { width: 70%; }

.v-skel .vs-price-block {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-top: 1px dashed var(--skel-line);
  border-bottom: 1px dashed var(--skel-line);
}
.v-skel .vs-line--price { height: 32px; width: 160px; }
.v-skel .vs-pill { width: 110px; height: 26px; border-radius: 999px; }

.v-skel .vs-line--label { height: 12px; width: 140px; }

.v-skel .vs-payment { display: flex; flex-direction: column; gap: 10px; }
.v-skel .vs-pay-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.v-skel .vs-pay { height: 64px; border-radius: 14px; }

.v-skel .vs-form { display: flex; flex-direction: column; gap: 10px; }
.v-skel .vs-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.v-skel .vs-field { height: 48px; border-radius: 10px; }

.v-skel .vs-cta {
  margin-top: 8px;
  height: 56px;
  border-radius: 14px;
}

@media (max-width: 600px) {
  .v-skel .vs-form-grid { grid-template-columns: 1fr; }
  .v-skel .vs-pay-row   { grid-template-columns: 1fr; }
  .v-skel .vs-pay { height: 48px; }
}

@media (prefers-reduced-motion: reduce) {
  .v-skel .shimmer { animation: none; }
}
`;
