import React, { useState } from 'react';
import { Table, Form, InputGroup, Button, Pagination } from 'react-bootstrap';

/**
 * Reusable DataTable component used across multiple modules
 * Features: sorting, filtering, pagination
 */
const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  sortable = true,
  filterable = true,
  pagination = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
  actions = [],
  className = '',
  onRowClick = null,
}) => {
  // State for sorting, filtering, and pagination
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [filterText, setFilterText] = useState('');

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort field
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter data based on current filters
  const filteredData = data.filter((item) => {
    // If no filter text, include all items
    if (!filterText) return true;

    // Search in all columns
    return columns.some((column) => {
      const value = item[column.field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(filterText.toLowerCase());
    });
  });

  // Sort the filtered data
  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;

        // Sort based on data type
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Default string comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        return sortDirection === 'asc'
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      })
    : filteredData;

  // Paginate the sorted data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = pagination
    ? sortedData.slice(startIndex, startIndex + itemsPerPage)
    : sortedData;

  // Generate pagination controls
  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span className="me-2">Items per page:</span>
          <Form.Select
            size="sm"
            style={{ width: 'auto', display: 'inline-block' }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        </div>

        <Pagination className="mb-0">
          <Pagination.First
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          />
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />

          {/* Show at most 5 page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              // If 5 or fewer pages, show all
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              // If current page is near the start
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // If current page is near the end
              pageNum = totalPages - 4 + i;
            } else {
              // Otherwise center around current page
              pageNum = currentPage - 2 + i;
            }

            return (
              <Pagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          })}

          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
          <Pagination.Last
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          />
        </Pagination>

        <div>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{' '}
          {sortedData.length} entries
        </div>
      </div>
    );
  };

  return (
    <div className={`data-table ${className}`}>
      {filterable && (
        <div className="filter-container mb-3">
          <InputGroup>
            <Form.Control
              placeholder="Search..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            />
            {filterText && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setFilterText('');
                  setCurrentPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </div>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.field}
                onClick={() => sortable && handleSort(column.field)}
                style={{
                  cursor: sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                {column.header}
                {sortable && sortField === column.field && (
                  <span className="ms-1">
                    {sortDirection === 'asc' ? (
                      <i className="fas fa-sort-up"></i>
                    ) : (
                      <i className="fas fa-sort-down"></i>
                    )}
                  </span>
                )}
              </th>
            ))}
            {actions.length > 0 && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center">
                No data available
              </td>
            </tr>
          ) : (
            paginatedData.map((item) => (
              <tr
                key={item[keyField]}
                onClick={() => onRowClick && onRowClick(item)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <td key={`${item[keyField]}-${column.field}`}>
                    {column.formatter
                      ? column.formatter(item[column.field], item)
                      : item[column.field]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="actions-cell">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'primary'}
                        size="sm"
                        className={index > 0 ? 'ms-1' : ''}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event
                          action.onClick(item);
                        }}
                        disabled={action.isDisabled ? action.isDisabled(item) : false}
                      >
                        {action.icon && <i className={`${action.icon} me-1`}></i>}
                        {action.label}
                      </Button>
                    ))}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {renderPagination()}
    </div>
  );
};

export default DataTable;