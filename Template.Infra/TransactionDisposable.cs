using System;
using Template.Core;
using Microsoft.EntityFrameworkCore.Storage;

namespace Template.Infra
{
    public class TransactionDisposable : ITransaction
    {
        private readonly IDbContextTransaction _transaction;

        public TransactionDisposable(IDbContextTransaction transaction)
        {
            _transaction = transaction;
        }

        public void Commit()
        {
            _transaction.Commit();
        }

        public void Rollback()
        {
            _transaction.Rollback();
        }

        public void Dispose()
        {
            _transaction.Dispose();
        }
    }
}
