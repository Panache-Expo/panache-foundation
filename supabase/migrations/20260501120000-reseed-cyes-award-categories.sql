with seeded_categories(slug, name, sort_order) as (
  values
    ('youth-entrepreneur-of-the-year', 'Youth Entrepreneur of the Year', 10),
    ('startup-of-the-year', 'Startup of the Year', 20),
    ('technology-innovator-of-the-year', 'Technology Innovator of the Year', 30),
    ('agribusiness-of-the-year', 'Agribusiness of the Year', 40),
    ('creative-entrepreneur-of-the-year', 'Creative Entrepreneur of the Year', 50),
    ('social-impact-business-of-the-year', 'Social Impact Business of the Year', 60),
    ('community-leader-of-the-year', 'Community Leader of the Year', 70),
    ('ngo-of-the-year', 'NGO of the Year', 80),
    ('youth-empowerment-initiative-of-the-year', 'Youth Empowerment Initiative of the Year', 90),
    ('education-impact-of-the-year', 'Education Impact of the Year', 100),
    ('health-impact-of-the-year', 'Health Impact of the Year', 110),
    ('environmental-impact-of-the-year', 'Environmental Impact of the Year', 120),
    ('corporate-impact-of-the-year', 'Corporate Impact of the Year', 130),
    ('sme-of-the-year', 'SME of the Year', 140),
    ('financial-institution-of-the-year', 'Financial Institution of the Year', 150),
    ('woman-in-business-of-the-year', 'Woman in Business of the Year', 160),
    ('diaspora-impact-of-the-year', 'Diaspora Impact of the Year', 170),
    ('emerging-youth-leader-of-the-year', 'Emerging Youth Leader of the Year', 180),
    ('media-and-advocacy-of-the-year', 'Media & Advocacy of the Year', 190),
    ('voice-of-the-generation-award', 'Voice of the Generation Award', 200)
)
insert into public.cyes_award_categories (slug, name, sort_order, status, voting_enabled)
select slug, name, sort_order, 'active', true
from seeded_categories
on conflict (slug) do update
set
  name = excluded.name,
  status = 'active',
  voting_enabled = true,
  sort_order = excluded.sort_order,
  updated_at = now();
