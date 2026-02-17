class Users::RegistrationsController < Devise::RegistrationsController
  protected

  def update_resource(resource, params)
    if resource.provider.present?
      params.delete("current_password")
      resource.update_without_password(params)
    elsif params[:password].blank?
      params.delete("current_password")
      params.delete("password")
      params.delete("password_confirmation")
      resource.update_without_password(params)
    else
      super
    end
  end
end
