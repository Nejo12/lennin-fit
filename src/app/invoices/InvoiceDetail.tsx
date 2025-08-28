import {
  useInvoiceItems,
  useAddItem,
  useUpdateItem,
  useDeleteItem,
} from './api';
import styles from './Invoices.module.scss';

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
  const { data: items = [], isLoading } = useInvoiceItems(invoiceId);
  const addItem = useAddItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  if (!invoiceId) return null;

  return (
    <div className={`${styles.invoiceDetail} ${styles.card}`}>
      <h3 style={{ marginTop: 0 }}>Items</h3>
      {isLoading ? <div className={styles.loading}>Loading…</div> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '55%' }}>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} className={styles.tableRow}>
                <td>
                  <input
                    className={styles.tableInput}
                    defaultValue={it.description}
                    onBlur={e =>
                      updateItem.mutate({
                        id: it.id,
                        fields: { description: e.target.value },
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    className={styles.tableInput}
                    defaultValue={it.quantity}
                    onBlur={e =>
                      updateItem.mutate({
                        id: it.id,
                        fields: { quantity: Number(e.target.value) },
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={styles.tableInput}
                    defaultValue={it.unit_price}
                    onBlur={e =>
                      updateItem.mutate({
                        id: it.id,
                        fields: { unit_price: Number(e.target.value) },
                      })
                    }
                  />
                </td>
                <td className={styles.amount}>
                  {Number(it.amount).toFixed(2)}
                </td>
                <td>
                  <button
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={() => deleteItem.mutate({ id: it.id })}
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btn}
          onClick={() =>
            addItem.mutate({
              invoice_id: invoiceId,
              description: 'New item',
              quantity: 1,
              unit_price: 0,
            })
          }
        >
          + Add item
        </button>
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.noPrint}`}
          style={{ marginLeft: 8 }}
          onClick={() => window.print()}
        >
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}

export default InvoiceDetail;
