const { expect } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');

const User = artifacts.require('v1/User');

contract('User', accounts => {
  const [owner, other] = accounts;

  beforeEach(async () => {
    this.user = await User.new();
    await this.user.initialize({ from: owner });
  });

  describe('initialize', () => {
    it('set owner as admin', async () => {
      const ADMIN_ROLE = await this.user.ADMIN_ROLE();

      expect((await this.user.getRoleMember(ADMIN_ROLE, 0))).to.equal(owner);
    });

    it('set admin manage admin', async () => {
      const ADMIN_ROLE = await this.user.ADMIN_ROLE();

      expect((await this.user.getRoleAdmin(ADMIN_ROLE))).to.equal(ADMIN_ROLE);
    });

    it('set admin manage seller', async () => {
      const ADMIN_ROLE = await this.user.ADMIN_ROLE();
      const SELLER_ROLE = await this.user.SELLER_ROLE();

      expect((await this.user.getRoleAdmin(SELLER_ROLE))).to.equal(ADMIN_ROLE);
    });
  });

  it('guard owner role modification', async () => {
    await expectRevert(
      this.user.addAdmin(owner),
      'User: account is owner',
    );
  });

  it('add role', async () => {
    const SELLER_ROLE = await this.user.SELLER_ROLE();

    await this.user.addSeller(other);

    expect((await this.user.getRoleMember(SELLER_ROLE, 0))).to.equal(other);
  });

  it('remove role', async () => {
    const SELLER_ROLE = await this.user.SELLER_ROLE();

    await this.user.revokeSeller(other);

    expect((await this.user.getRoleMemberCount(SELLER_ROLE)).toString()).to.equal('0');
  });
});
