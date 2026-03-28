using System;
using Template.Core;
using Template.Infra.Context;

namespace Template.Infra
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly TemplateContext _context;

        public UnitOfWork(TemplateContext context)
        {
            _context = context;
        }

        public ITransaction BeginTransaction()
        {
            return new TransactionDisposable(_context.Database.BeginTransaction());
        }
    }
}
