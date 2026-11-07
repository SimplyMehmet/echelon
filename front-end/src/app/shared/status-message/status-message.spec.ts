import { TestBed } from '@angular/core/testing';
import { StatusMessage } from './status-message';

describe('StatusMessage', () => {
  const render = async (status: 'loading' | 'error' | 'empty') => {
    const fixture = TestBed.createComponent(StatusMessage);
    fixture.componentRef.setInput('status', status);
    fixture.componentRef.setInput('emptyText', 'No events yet.');
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).textContent?.trim();
  };

  it('should describe each status', async () => {
    expect(await render('loading')).toContain('Loading');
    expect(await render('error')).toContain("Couldn't load");
    expect(await render('empty')).toBe('No events yet.');
  });
});
