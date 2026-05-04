INSERT INTO categories (name, description) VALUES
  ('Sprzet komputerowy', 'Komputery, monitory, drukarki, akcesoria'),
  ('Oprogramowanie',     'Systemy operacyjne, aplikacje, licencje'),
  ('Siec i internet',    'Wi-Fi, VPN, dostep do zasobow sieciowych'),
  ('Konta i uprawnienia','Resetowanie hasel, dostepy, konta systemowe'),
  ('Inne',               'Zgloszenia nieprzypisane do innych kategorii')
ON CONFLICT (name) DO NOTHING;
