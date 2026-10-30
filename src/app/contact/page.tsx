import React from 'react';
import { readStore } from '@/lib/server-storage';
import { initialContactInfo, ContactInfo } from '@/data/contact';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';
import ContactClientView from './contact-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact and Book | Shirin Shila Official Talent Management Desk',
  description: 'Official representation, casting inquiries, brand endorsement, and talent booking desk for Bangladeshi film actress Shirin Shila.',
  alternates: {
    canonical: '/contact',
  },
};

export default async function ContactPage() {
  const [contact, pages] = await Promise.all([
    readStore<ContactInfo>('contactInfo').catch(() => initialContactInfo),
    readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry),
  ]);

  const activeContact = contact || initialContactInfo;
  const pageConfig = pages?.contact || defaultPagesRegistry.contact;

  return <ContactClientView pageConfig={pageConfig} contact={activeContact} />;
}
