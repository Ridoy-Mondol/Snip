import { JsonRpc } from 'eosjs';

const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;
export const fetchTableRows = async ({
  table,
  limit = 100,
  code = contractAcc,
  scope,
  lower_bound,
  filterFn,
}: {
  table: string,
  limit?: number,
  code?: string;
  scope?: string,
  lower_bound?: string;
  filterFn?: (rows: any[]) => any[],
}) => {
  try {
    const rpc = new JsonRpc(endpoint);
    const result = await rpc.get_table_rows({
      json: true,
      code,
      scope: scope || contractAcc,
      table,
      limit,
      lower_bound,
    });

    let rows = result.rows;
    if (filterFn) {
      rows = filterFn(rows);
    }

    return rows;
  } catch (error) {
    console.error(`Failed to fetch table: ${table}`, error);
    return [];
  }
};
