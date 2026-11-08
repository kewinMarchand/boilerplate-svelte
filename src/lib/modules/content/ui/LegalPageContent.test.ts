import { render, screen, within } from '@testing-library/svelte'

import LegalPageContent from './LegalPageContent.svelte'

vi.mock('$app/state', () => ({
  page: {
    url: new URL('http://localhost/donnees-personnelles'),
    data: { siteIdentity: { name: 'Boilerplate' } },
  },
}))

const PAGE = {
  title: 'Données personnelles',
  introduction: '<p>Avant-propos.</p>',
  sections: [
    {
      title: 'Vos droits',
      html: '<ul><li>accès ;</li></ul><p><a href="https://www.cnil.fr/">CNIL</a></p>',
    },
  ],
}

describe('LegalPageContent', () => {
  it("garde le titre de repli et affiche un message d'erreur si l'API ne répond pas", () => {
    render(LegalPageContent, {
      legalPage: { status: 'error', message: 'Oups' },
      fallbackTitle: 'Mentions légales',
      description: 'Description.',
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mentions légales')
    expect(screen.getByTestId('legal-error')).toHaveTextContent('Oups')
    expect(screen.queryByTestId('legal-section')).not.toBeInTheDocument()
  })

  it('affiche le titre, l’introduction et chaque section avec son HTML', () => {
    render(LegalPageContent, {
      legalPage: { status: 'success', page: PAGE },
      fallbackTitle: 'Repli',
      description: 'Description.',
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Données personnelles')
    expect(screen.getByText('Avant-propos.')).toBeInTheDocument()
    const section = screen.getByTestId('legal-section')
    expect(section).toHaveTextContent('Vos droits')
    expect(within(section).getByRole('link', { name: 'CNIL' })).toHaveAttribute(
      'href',
      'https://www.cnil.fr/',
    )
    expect(within(section).getByRole('listitem')).toHaveTextContent('accès ;')
    expect(screen.queryByTestId('legal-error')).not.toBeInTheDocument()
  })
})
