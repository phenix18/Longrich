import { Product, ShopSettings } from '../types';

/**
 * Génère et ouvre une fiche imprimable de la Grille Tarifaire des produits.
 * L'utilisateur peut ensuite "Enregistrer au format PDF" via la boîte
 * d'impression du navigateur (disponible sur mobile et ordinateur).
 */
export function generatePriceListPdf(products: Product[], settings: ShopSettings) {
  const shopName = settings.shopName || 'Longrich Burkina Faso';
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Regroupement par catégorie pour une lecture claire
  const grouped = products.reduce<Record<string, Product[]>>((acc, product) => {
    const key = product.category || 'Autres';
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const formatPrice = (value: number) =>
    value > 0 ? `${value.toLocaleString('fr-FR')} F` : '—';

  const rows = categories
    .map((category) => {
      const items = grouped[category]
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => {
          const displayPrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.retailPrice;
          const promo =
            p.salePrice && p.salePrice > 0
              ? `<span class="old">${formatPrice(p.retailPrice)}</span>`
              : '';
          return `
            <tr>
              <td class="name">${escapeHtml(p.name)}</td>
              <td class="price">${promo}${formatPrice(displayPrice)}</td>
              <td class="stock">${p.stock > 0 ? p.stock : 'Rupture'}</td>
            </tr>`;
        })
        .join('');

      return `
        <tr class="cat-row">
          <td colspan="3">${escapeHtml(category)}</td>
        </tr>
        ${items}`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Grille Tarifaire - ${escapeHtml(shopName)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #047857;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th {
      background: #047857;
      color: #fff;
      text-align: left;
      padding: 8px 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
    .cat-row td {
      background: #f0fdf4;
      color: #047857;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .name { font-weight: 600; }
    .price { text-align: right; font-weight: 700; color: #047857; white-space: nowrap; }
    .price .old {
      color: #94a3b8;
      text-decoration: line-through;
      font-weight: 400;
      margin-right: 6px;
      font-size: 10px;
    }
    .stock { text-align: center; color: #64748b; }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    @media print {
      body { padding: 0; }
      .cat-row td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Grille Tarifaire</h1>
    <p>${escapeHtml(shopName)} &middot; Mise à jour du ${today}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Produit</th>
        <th style="text-align:right">Prix</th>
        <th style="text-align:center">Stock</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="footer">
    <p>Copyright Korogo &copy; 2026 &middot; Document généré automatiquement</p>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert(
      "Veuillez autoriser les fenêtres pop-up pour télécharger la grille tarifaire."
    );
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
